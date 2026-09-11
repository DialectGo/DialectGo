import fs from 'fs';
import axios from 'axios';
import { extractTextFromBase64 } from './ocr.service.js';
import { TranslationModel } from '../models/translation.model.js';
import FormDataLib from 'form-data';
import { Client } from '@gradio/client';
import { preprocessText } from './preprocessor.service.js';
import { dialectize } from './reverseCanonicalizer.service.js';
import { analyzeTranslation, analyzeDocumentType, reconstructLayout, normalizeInformalText, splitIntoSemanticChunks } from './metaLayer.service.js';
import {
    translationCache,
    lineTranslationCache,
    createTranslationCacheKey,
    createLineCacheKey,
} from './cache.service.js';
import { translateWithGroq, translateDocumentWithGroq } from './groqTranslation.service.js';
import { maskProperNouns, unmaskProperNouns } from './ner.service.js';

// Maximum number of concurrent NLLB line translation calls
const TRANSLATION_CONCURRENCY = 5;

// Concurrency for dialectization (post-translation corpus replacement)
const DIALECTIZE_CONCURRENCY = 5;

// Timeout for the HuggingFace/Flask fallback (kept short since Groq is primary)
const HF_FALLBACK_TIMEOUT_MS = 15000;

const COLAB_URL = process.env.COLAB_URL;
const HF_SPACE = process.env.HF_SPACE || 'DialectGoOOO/TranslationCebTagEng';
const HF_TOKEN = process.env.HF_TOKEN;

const languageNameMap = {
    en: 'English',
    english: 'English',
    ceb: 'Cebuano',
    cebuano: 'Cebuano',
    fil: 'Tagalog',
    tl: 'Tagalog',
    tagalog: 'Tagalog',
    tag: 'Tagalog',
};

let gradioClient = null;

const normalizeLanguageName = (lang) => {
    const value = String(lang || '').trim().toLowerCase();
    return languageNameMap[value] || value || 'English';
};

const getGradioClient = async () => {
    if (gradioClient) {
        return gradioClient;
    }

    const options = HF_TOKEN ? { hf_token: HF_TOKEN } : undefined;
    gradioClient = await Client.connect(HF_SPACE, options);
    return gradioClient;
};

const callHuggingFaceTranslation = async (text, sourceLang, targetLang) => {
    try {
        const client = await getGradioClient();
        
        let inputText = String(text || '').trim();
        // Check if the text is fully uppercase (has uppercase characters and no lowercase characters)
        const isAllCaps = inputText.length > 0 && inputText === inputText.toUpperCase() && inputText !== inputText.toLowerCase();
        
        // Normalize to sentence case to prevent NLLB hallucination
        if (isAllCaps) {
            inputText = inputText.charAt(0).toUpperCase() + inputText.slice(1).toLowerCase();
        }

        const result = await client.predict('/translate', {
            text: inputText,
            audio_path: null,
            source_lang_name: normalizeLanguageName(sourceLang),
            target_lang_name: normalizeLanguageName(targetLang),
        });

        if (Array.isArray(result?.data)) {
            let translated = typeof result.data[1] === 'string' ? result.data[1].trim() : '';
            // Restore ALL CAPS if the original text was ALL CAPS
            if (isAllCaps && translated) {
                translated = translated.toUpperCase();
            }
            return translated;
        }
        return '';
    } catch (e) {
        throw e;
    }
};

/**
 * Heuristic to detect NLLB seq2seq hallucinations.
 * NLLB hallucinates on non-grammatical fragments, all-caps strings, or heavy NER masks.
 *
 * NOTE: Filipino/Tagalog is naturally ~30-50% MORE verbose than English.
 * Thresholds must be set generously to avoid false positives on valid translations.
 */
const isHallucination = (sourceText, translatedText) => {
    if (!translatedText || !translatedText.trim()) return true;

    // 1. Extreme length explosion — valid Filipino translations can be 2-3x longer.
    // Only flag if output is 8x the source length to avoid false positives.
    if (sourceText.length > 30 && translatedText.length > sourceText.length * 8) {
        return true;
    }

    // 2. Repeated word loops — the classic infinite loop hallucination.
    // Check BOTH consecutive (AAAAA) and alternating (ABABAB) patterns.
    const words = translatedText.split(/\s+/);
    if (words.length > 8) {
        let maxConsecutive = 0;
        let currentConsecutive = 1;

        for (let i = 1; i < words.length; i++) {
            if (words[i].toLowerCase() === words[i-1].toLowerCase() && words[i].length > 2) {
                currentConsecutive++;
                maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
            } else {
                currentConsecutive = 1;
            }
        }
        if (maxConsecutive >= 6) return true;

        // Alternating A-B-A-B pattern: count word frequency at even vs odd positions.
        // If any word > 3 chars appears at ≥ 40% of positions, it's looping.
        const freqMap = {};
        for (const w of words) {
            if (w.length > 3) {
                const lw = w.toLowerCase();
                freqMap[lw] = (freqMap[lw] || 0) + 1;
            }
        }
        const topWordCount = Math.max(0, ...Object.values(freqMap));
        if (topWordCount >= 4 && topWordCount / words.length >= 0.25) return true;
    }

    // 3. Lost NER tags — if source had <n0> but output dropped it, NLLB hallucinated.
    const sourceTags = sourceText.match(/<n\d+>/g) || [];
    if (sourceTags.length > 0) {
        let missingTags = 0;
        for (const tag of sourceTags) {
            if (!translatedText.includes(tag)) missingTags++;
        }
        // Flag only if ALL tags are lost (NLLB completely ignored the placeholders)
        if (missingTags === sourceTags.length) return true;
    }

    return false;
};

/**
 * Checks if text is an untranslatable fragment — i.e., contains no meaningful
 * translatable words after stripping NER tags, numbers, dates, and academic codes.
 * These should be passed through as-is to avoid HF hallucinations and Groq empty returns.
 *
 * Examples caught:
 *   "<n3> April 30, 2026 BSIT 3-1" → nothing to translate
 *   "<n2> <n1> <n6>"               → just proper-noun tags
 *   "<n8> 2"                        → tag + page number
 *   "https://doi.org/10.1234"       → URL
 */
const isUntranslatableFragment = (text) => {
    let stripped = text;

    // 1. Remove NER placeholder tags
    stripped = stripped.replace(/<n\d+>/gi, '');

    // 2. If the core content is a URL (after stripping tags), treat as untranslatable.
    //    e.g. "https://opinion.<n9>/188998/english-should-be-a-border..."
    //    After tag strip: "https://opinion./188998/english-should-be-a-border..."
    if (/^\s*https?:\/\//i.test(stripped)) return true;

    // 3. Remove common English month names (already untranslatable in academic context)
    stripped = stripped.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi, '');

    // 4. Remove common Philippine academic course codes (BSIT, BSCS, AB, BS, etc.) and honorifics
    stripped = stripped.replace(/\b(BS[A-Z]{0,6}|AB|MA|PhD|MS|Mr|Mrs|Ms|Dr|Prof)\b/gi, '');

    // 5. Remove remaining URLs
    stripped = stripped.replace(/https?:\/\/\S+/gi, '');

    // 6. Remove numbers, whitespace, and all punctuation
    stripped = stripped.replace(/[\d\s.,;:\-()\[\]/#@&%+='"!?|_~`^●]/g, '').trim();

    return stripped.length === 0;
};

// ─── In-flight document request deduplication ───────────────────────────────
// Prevents double-tap / rapid retry from spinning up two full parallel pipelines
// that both hit Groq rate limits and waste compute.
const inFlightDocumentRequests = new Map();


/**
 * PRIMARY translation function — HF-first with Groq/Flask fallback.
 *
 * @param {string} text - Text to translate
 * @param {string} sourceLang
 * @param {string} targetLang
 * @param {string|null} targetDialect - Passed to Groq for better dialect-aware output
 * @returns {Promise<string>} Translated text
 */
export const performTranslation = async (text, sourceLang, targetLang, targetDialect = null) => {
    if (!text || !text.trim()) return text;

    // ── Guard: untranslatable fragments (NER tags, numbers, punctuation only) ──
    // e.g. "<n8> 2" or "<n2> <n1> <n6>" — pass straight through; LLMs can't translate these.
    if (isUntranslatableFragment(text)) {
        return text;
    }

    // ── Per-line translation cache check ──────────────────────────────────────
    const lineCacheKey = createLineCacheKey(text, sourceLang, targetLang);
    const cachedLine = lineTranslationCache.get(lineCacheKey);
    if (cachedLine !== undefined) {
        return cachedLine;
    }

    let result = null;

    // ── Step 1: Try HuggingFace (slow but free) ──────────────────────────────────────
    try {
        const translatedText = await callHuggingFaceTranslation(text, sourceLang, targetLang);
        if (translatedText && !isHallucination(text, translatedText)) {
            result = translatedText;
        } else if (translatedText) {
            console.warn(`[Translation] HF Hallucination detected for: "${text.slice(0, 30)}...". Falling back to Groq.`);
        }
    } catch (hfError) {
        console.warn('[Translation] HuggingFace failed, falling back to Groq:', hfError.message);
    }

    // ── Step 2: Groq fallback (fast, handles complex fragments well) ──────────────────────────────────────
    if (!result) {
        try {
            result = await translateWithGroq(text, sourceLang, targetLang, targetDialect);
        } catch (groqError) {
            console.warn('[Translation] Groq fallback failed:', groqError.message);
        }
    }

    // ── Step 3: Flask/Colab fallback (last resort) ────────────────────────────
    if (!result && COLAB_URL) {
        try {
            const response = await axios.post(`${COLAB_URL}/translate`,
                { input: text, source_lang: sourceLang, target_lang: targetLang },
                { headers: { 'ngrok-skip-browser-warning': 'true' }, timeout: 10000 }
            );
            result = response.data.translation;
        } catch (flaskError) {
            console.warn('[Translation] All fallbacks failed — returning original text:', flaskError.message);
            // Gracefully return original rather than crashing the entire document pipeline
            return text;
        }
    }

    // Cache the result for reuse
    if (result) lineTranslationCache.set(lineCacheKey, result);

    return result || text; // Ultimate fallback: return original text
};

/**
 * Translate an array of lines in parallel with a concurrency limit.
 * This replaces the serial for-loop and is the primary speed improvement.
 *
 * @param {string[]} lines - Array of text lines to translate
 * @param {string} sourceLang
 * @param {string} targetLang
 * @param {string|null} targetDialect
 * @param {number} batchSize - Max concurrent requests
 * @returns {Promise<{nllbOutput: string, finalText: string, wasModified: boolean, replacements: Array}[]>}
 */
async function parallelTranslateLines(lines, sourceLang, targetLang, targetDialect, batchSize = TRANSLATION_CONCURRENCY) {
    const results = new Array(lines.length);

    // Process lines in batches to limit concurrency
    for (let i = 0; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, i + batchSize);

        const batchPromises = batch.map(async (line, batchIdx) => {
            const globalIdx = i + batchIdx;

            // Preserve empty lines without any API call
            if (line.trim().length === 0) {
                return { index: globalIdx, nllbOutput: line, finalText: line, wasModified: false, replacements: [] };
            }

            const nllbOutput = await performTranslation(line, sourceLang, targetLang);

            if (targetDialect) {
                const dialectResult = await dialectize(nllbOutput, targetDialect);
                return {
                    index: globalIdx,
                    nllbOutput,
                    finalText: dialectResult.dialectText,
                    wasModified: dialectResult.wasModified,
                    replacements: dialectResult.replacements || [],
                };
            }

            return { index: globalIdx, nllbOutput, finalText: nllbOutput, wasModified: false, replacements: [] };
        });

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(r => { results[r.index] = r; });
    }

    return results;
}

/**
 * Extracts text from a base64-encoded image using the PaddleOCR microservice.
 * The base64 string must have the data URI prefix already stripped.
 */
export const performOCR = async (base64Image) => {
    const result = await extractTextFromBase64(base64Image);
    // extractTextFromBase64 now returns { text, details, layoutHints }
    return typeof result === 'string' ? result : result.text;
};

export const performSpeechToText = async (audioPath, targetLang, sourceLang) => {
    try {
        const client = await getGradioClient();
        const fileBuffer = await fs.promises.readFile(audioPath);
        const audioBlob = new Blob([fileBuffer], { type: 'audio/wav' });

        const result = await client.predict('/translate', {
            text: '',
            audio_path: audioBlob,
            source_lang_name: normalizeLanguageName(sourceLang),
            target_lang_name: normalizeLanguageName(targetLang),
        });

        if (Array.isArray(result?.data) && result.data.length >= 2) {
            const transcript = result.data[0];
            const translation = result.data[1];

            return {
                status: "success",
                transcript: typeof transcript === 'string' ? transcript.trim() : '',
                translation: typeof translation === 'string' ? translation.trim() : '',
            };
        }
    } catch (error) {
        console.warn('Hugging Face audio translation failed, falling back to Flask backend:', error.message || error);
    }

    const form = new FormDataLib();
    form.append('audio', fs.createReadStream(audioPath));
    form.append('target_lang', targetLang);
    form.append('source_lang', sourceLang);

    const response = await axios.post(`${COLAB_URL}/translate`, form, {
        headers: {
            ...form.getHeaders(),
            'ngrok-skip-browser-warning': 'true'
        },
    });

    console.log('DEBUG: Flask response structure:', response.data);
    return response.data;
};

/**
 * Pre-processed translation — runs the full preprocessing pipeline
 * (tokenize → corpus lookup → sentiment → canonicalize) before
 * sending the standardized text to the NLLB translation service.
 * 
 * When a targetDialect is provided, also runs the reverse
 * canonicalization pipeline on the NLLB output to convert
 * standard words into dialect-specific equivalents.
 *
 * @param {string} text - Raw user input text
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @param {string|null} targetDialect - Optional dialect variant (e.g., 'Boholano', 'Batangeño')
 * @param {string|null} token - Optional user session token
 * @returns {Promise<{originalText, canonicalizedText, translatedText, preprocessing, dialectization}>}
 */
export const performPreprocessedTranslation = async (text, sourceLang, targetLang, targetDialect = null, token = null, isDocument = false) => {
    const pipelineStart = Date.now();

    // ── Full translation result cache check ───────────────────────────────
    const fullCacheKey = createTranslationCacheKey(text, sourceLang, targetLang, targetDialect);
    const cachedResult = translationCache.get(fullCacheKey);
    if (cachedResult) {
        console.log(`[Cache] Translation cache HIT — skipping full pipeline (~<10ms)`);
        return cachedResult;
    }

    // Step 1: Run preprocessing (tokenize → corpus lookup → sentiment → canonicalize)
    // This runs locally and is fast (~300-600ms)
    const preprocessResult = await preprocessText(text, sourceLang, token);
    const textForTranslation = preprocessResult.canonicalizedText;

    // Step 1.5: Mask proper nouns (NER) to prevent NLLB from translating names
    const { maskedText, entityMap } = await maskProperNouns(textForTranslation);

    console.log(`[PreprocessedTranslation] Preprocessing done in ${preprocessResult.metadata?.pipelineMs ?? 0}ms, sending to HuggingFace...`);

    // For documents, PDFs often have hard line-breaks (\n) at the end of every visual line (~80 chars).
    // This bypassed the >150 char chunking threshold and fed fragmented sentences to NLLB.
    // Fix: Split by double newlines for true paragraphs, and merge single newlines.
    const splitRegex = isDocument ? /\n\s*\n/ : /\n/;
    const paragraphs = maskedText.split(splitRegex);
    
    let semanticSentences = [];
    let sentenceToParagraphMap = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
        let para = paragraphs[i];
        
        if (isDocument) {
            // Unwrap hard line breaks within the true paragraph
            para = para.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        }

        // Only run the LLM chunker on long paragraphs to save time on short chat messages
        if (!para.trim() || para.length < 150) {
            semanticSentences.push(para);
            sentenceToParagraphMap.push(i);
        } else {
            console.log(`[Chunking] Splitting paragraph ${i+1} (${para.length} chars) into semantic sentences...`);
            const sentences = await splitIntoSemanticChunks(para);
            for (const s of sentences) {
                semanticSentences.push(s);
                sentenceToParagraphMap.push(i);
            }
        }
    }

    // Translate all sentences IN PARALLEL (batched concurrency)
    const chunkResults = await parallelTranslateLines(semanticSentences, sourceLang, targetLang, targetDialect, TRANSLATION_CONCURRENCY);

    // Reconstruct the paragraphs from translated sentences, unmasking entities
    const translatedParagraphs = new Array(paragraphs.length).fill('');
    for (let i = 0; i < chunkResults.length; i++) {
        const pIdx = sentenceToParagraphMap[i];
        const unmaskedText = unmaskProperNouns(chunkResults[i].finalText, entityMap);
        
        if (translatedParagraphs[pIdx] && unmaskedText) {
            // Join sentences within a paragraph with a space
            translatedParagraphs[pIdx] += ' ' + unmaskedText;
        } else {
            translatedParagraphs[pIdx] += unmaskedText;
        }
    }

    let wasDialectModified = chunkResults.some(r => r.wasModified);
    let allDialectReplacements = chunkResults.flatMap(r => r.replacements);

    let finalTranslatedText = translatedParagraphs.join('\n');
    let dialectMeta = null;

    if (targetDialect) {
        dialectMeta = {
            wasModified: wasDialectModified,
            replacements: allDialectReplacements,
            targetDialect,
            metadata: { pipelineMs: Date.now() - pipelineStart }
        };
    }

    const totalMs = Date.now() - pipelineStart;
    console.log('[PreprocessedTranslation] Pipeline complete:', {
        engine: 'HuggingFace',
        totalPipelineMs: totalMs,
        preprocessMs: preprocessResult.metadata?.pipelineMs ?? 0,
        translationMs: totalMs - (preprocessResult.metadata?.pipelineMs ?? 0),
        wasModified: preprocessResult.wasModified,
        replacements: preprocessResult.replacements.length,
        dialect: targetDialect || 'Standard',
    });

    const result = {
        originalText: preprocessResult.originalText,
        canonicalizedText: preprocessResult.canonicalizedText,
        translatedText: finalTranslatedText,
        preprocessing: {
            wasModified: preprocessResult.wasModified,
            replacements: preprocessResult.replacements,
            sentimentAnalysis: preprocessResult.sentimentAnalysis,
            metadata: preprocessResult.metadata
        },
        dialectization: dialectMeta
    };

    // Cache the full result (skip for documents to avoid memory bloat)
    if (!isDocument) {
        translationCache.set(fullCacheKey, result);
    }

    return result;
};

/**
 * Translation with LLM breakdown — runs the full pipeline plus
 * the Groq-powered Meta-Layer analysis for word-by-word breakdowns,
 * sentiment evaluation, and construction analysis.
 * 
 * This is the opt-in "detailed analysis" mode triggered by the user.
 *
 * @param {string} text - Raw user input text
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @param {string|null} targetDialect - Optional dialect variant
 * @returns {Promise<Object>} Full translation result + breakdown
 */
export const performTranslationWithBreakdown = async (text, sourceLang, targetLang, targetDialect = null, token = null, isDocument = false) => {
    // Step 1-3: Run the existing pipeline (preprocess → NLLB → dialectize)
    const result = await performPreprocessedTranslation(text, sourceLang, targetLang, targetDialect, token, isDocument);

    // Step 4: Run LLM Meta-Layer analysis on the translation pair
    const breakdown = await analyzeTranslation({
        sourceText: text,
        translatedText: result.translatedText,
        sourceLang,
        targetLang,
        targetDialect,
        preprocessingMeta: result.preprocessing,
    });

    console.log('[MetaLayer] Breakdown generated:', {
        success: breakdown.success,
        wordCount: breakdown.wordByWord?.length ?? 0,
        tone: breakdown.sentimentEvaluation?.detectedTone ?? 'N/A',
        analysisMs: breakdown.metadata?.analysisMs ?? 'N/A',
    });

    return {
        ...result,
        breakdown,
    };
};

/**
 * Enhanced document translation pipeline — runs the full set of LLM meta-layers:
 *   1. Document Type Detection → classify content type, set tone context
 *   2. Layout Reconstruction → if OCR data exists, restructure into Markdown with segments
 *   3. Preprocessed Translation → tokenize/corpus/canonicalize + chunked NLLB
 *   4. Breakdown Analysis → word-by-word + sentiment (opt-in)
 *
 * @param {string} text - Raw extracted text
 * @param {string} sourceLang - Source language
 * @param {string} targetLang - Target language
 * @param {string|null} targetDialect - Optional dialect variant
 * @param {string|null} token - Auth token
 * @param {Array|null} ocrDetails - OCR per-line details with bounding boxes
 * @param {Object|null} layoutHints - Paragraph groupings from OCR spatial analysis
 * @param {boolean} withBreakdown - Whether to run breakdown analysis
 * @returns {Promise<Object>} Enriched translation result
 */
export const performDocumentTranslation = async (
    text, sourceLang, targetLang, targetDialect = null, token = null,
    ocrDetails = null, layoutHints = null, withBreakdown = false
) => {
    const pipelineStart = Date.now();

    // ── Document cache check ───────────────────────────────
    const cachePrefix = withBreakdown ? 'DOC_BREAKDOWN' : 'DOC_STANDARD';
    const docCacheKey = createTranslationCacheKey(`${cachePrefix}_${text}`, sourceLang, targetLang, targetDialect);
    const cachedResult = translationCache.get(docCacheKey);
    if (cachedResult) {
        console.log(`[Cache] Document translation cache HIT — skipping full pipeline (<10ms)`);
        return cachedResult;
    }

    // ── In-flight request deduplication ───────────────────────────────────────
    // If an identical document is already being translated, wait for that result
    // instead of spinning up a second full pipeline (prevents double-tap 429s).
    if (inFlightDocumentRequests.has(docCacheKey)) {
        console.log(`[DocPipeline] Duplicate request detected \u2014 waiting for in-flight result...`);
        return inFlightDocumentRequests.get(docCacheKey);
    }

    // Steps 1+2: Run DocType Detection AND Layout Reconstruction concurrently.
    // Register the in-flight promise so duplicate requests can await it.
    let resolvePipeline, rejectPipeline;
    const pipelinePromise = new Promise((res, rej) => { resolvePipeline = res; rejectPipeline = rej; });
    inFlightDocumentRequests.set(docCacheKey, pipelinePromise);

    try {
    // These are independent of each other so we fire both at the same time.
    console.log('[DocPipeline] Steps 1+2 — Detecting doc type & reconstructing layout concurrently...');
    const docTypePromise = analyzeDocumentType(text);

    // Step 2: Layout Reconstruction (only for OCR images with spatial data)
    let layoutResult = null;
    let segmentedSourceText = text;
    let segments = [{ index: 0, text: text, isHeader: false, type: 'paragraph' }];

    if (ocrDetails && ocrDetails.length > 0) {
        const layoutPromise = reconstructLayout(text, ocrDetails, layoutHints);
        
        // Wait for both concurrent operations
        const [docType, layout] = await Promise.all([docTypePromise, layoutPromise]);
        layoutResult = layout;
        
        if (layout.success && layout.segments?.length > 0) {
            segments = layout.segments;
            segmentedSourceText = layout.formattedText || text;
        }

        // Step 2.5: Normalize Chat Slang (if applicable)
        if (docType.documentType === 'casual_chat' || 
            docType.toneGuidance?.formality === 'informal' || 
            docType.toneGuidance?.formality === 'colloquial') {
            console.log('[DocPipeline] Step 2.5 — Normalizing informal chat text...');
            segmentedSourceText = await normalizeInformalText(segmentedSourceText, sourceLang);
        }

        // Step 3: Translate the reconstructed text using HuggingFace
        console.log('[DocPipeline] Step 3 — Translating with tone context...');
        const translationResult = await performPreprocessedTranslation(
            segmentedSourceText, sourceLang, targetLang, targetDialect, token, true
        );

        // Step 4: Build translated segments by splitting on paragraph breaks
        const translatedSegments = buildTranslatedSegments(segments, translationResult.translatedText);

        // Step 5: Optional breakdown
        let breakdown = null;
        if (withBreakdown) {
            console.log('[DocPipeline] Step 4 — Running breakdown analysis...');
            breakdown = await analyzeTranslation({
                sourceText: text,
                translatedText: translationResult.translatedText,
                sourceLang, targetLang, targetDialect,
                preprocessingMeta: translationResult.preprocessing,
            });
            console.log('[MetaLayer] Breakdown generated:', {
                success: breakdown.success,
                wordCount: breakdown.wordByWord?.length ?? 0,
                tone: breakdown.sentimentEvaluation?.detectedTone ?? 'N/A',
                analysisMs: breakdown.metadata?.analysisMs ?? 'N/A',
            });
        }

        console.log(`[DocPipeline] Complete in ${Date.now() - pipelineStart}ms`);

        const finalOutput = {
            ...translationResult,
            documentType: docType,
            formattedSourceText: segmentedSourceText,
            segments: translatedSegments,
            layoutReconstruction: layoutResult,
            breakdown,
        };
        translationCache.set(docCacheKey, finalOutput);
        return finalOutput;
    } else {
        // No OCR spatial data (PDF/DOCX) — skip layout reconstruction.
        const docType = await docTypePromise;

        console.log('[DocPipeline] Step 2 — No spatial data, skipping layout reconstruction');
        console.log('[DocPipeline] Step 3 — Translating...');

        let result;
        let textToTranslate = text;

        if (docType.documentType === 'casual_chat' || 
            docType.toneGuidance?.formality === 'informal' || 
            docType.toneGuidance?.formality === 'colloquial') {
            console.log('[DocPipeline] Step 2.5 — Normalizing informal chat text...');
            textToTranslate = await normalizeInformalText(textToTranslate, sourceLang);
        }

        // The unified performPreprocessedTranslation pipeline automatically handles:
        // 1. Preprocessing (tokenization, sentiment)
        // 2. NER Masking
        // 3. Semantic Sentence Chunking for long text blocks
        if (withBreakdown) {
            result = await performTranslationWithBreakdown(textToTranslate, sourceLang, targetLang, targetDialect, token, true);
        } else {
            result = await performPreprocessedTranslation(textToTranslate, sourceLang, targetLang, targetDialect, token, true);
        }

        console.log(`[DocPipeline] Complete in ${Date.now() - pipelineStart}ms`);

        // Use the exact same split regex as performPreprocessedTranslation to ensure a 1:1 mapping.
        // The translation pipeline handles internal paragraph unwrapping.
        const sourceParagraphs = textToTranslate.split(/\n\s*\n/);
        
        const sourceSegments = sourceParagraphs.map((para, i) => ({
            index: i,
            text: para.trim(),
            isHeader: false,
            type: 'paragraph'
        })).filter(seg => seg.text.length > 0);

        const finalOutput = {
            ...result,
            documentType: docType,
            formattedSourceText: textToTranslate,
            segments: buildTranslatedSegments(sourceSegments, result.translatedText),
            layoutReconstruction: null,
            breakdown: result.breakdown || null,
        };
        
        translationCache.set(docCacheKey, finalOutput);
        resolvePipeline(finalOutput);
        return finalOutput;
    } // end else (no OCR data)
    } catch (pipelineError) {
        rejectPipeline(pipelineError);
        throw pipelineError;
    } finally {
        // Always clean up the in-flight entry so future requests don't get stuck waiting
        inFlightDocumentRequests.delete(docCacheKey);
    }
};

/**
 * Build translated segments by mapping source segments to translated text.
 */
function buildTranslatedSegments(sourceSegments, fullTranslatedText) {
    // Split translated text by paragraph breaks
    const translatedParagraphs = fullTranslatedText.split('\n').filter(p => p.trim());
    
    return sourceSegments.map((seg, i) => ({
        index: seg.index ?? i,
        sourceText: seg.text,
        translatedText: i < translatedParagraphs.length ? translatedParagraphs[i].trim() : '',
        isHeader: seg.isHeader || false,
        type: seg.type || 'paragraph',
    }));
}

export const saveHistory = async (userId, data, token) => await TranslationModel.saveHistory(userId, data, token);
export const getHistory = async (userId, token) => await TranslationModel.getHistory(userId, token);
export const deleteHistory = async (id, userId, token) => await TranslationModel.deleteHistory(id, userId, token);
export const addFeedback = async (userId, tId, rating, comment, token) => await TranslationModel.addFeedback(userId, tId, rating, comment, token);
export const submitRecommendation = async (userId, data, token) => await TranslationModel.saveUserTranslation(userId, data, token);

export const toggleBookmark = async (userId, translationId, token) => {
    return await TranslationModel.toggleBookmark(userId, translationId, token);
};

export const getSavedTranslations = async (userId, token) => {
    const result = await TranslationModel.getSavedTranslations(userId, token);
    
    // Transform result to match regular history structure so frontend doesn't need to change much
    if (result.data) {
        result.data = result.data.map(item => ({
            ...item.translation_history,
            is_bookmarked: true // Add flag
        }));
    }
    
    return result;
};