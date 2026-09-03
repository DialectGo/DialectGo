import fs from 'fs';
import axios from 'axios';
import { extractTextFromBase64 } from './ocr.service.js';
import { TranslationModel } from '../models/translation.model.js';
import FormDataLib from 'form-data';
import { Client } from '@gradio/client';
import { preprocessText } from './preprocessor.service.js';
import { dialectize } from './reverseCanonicalizer.service.js';
import { analyzeTranslation, analyzeDocumentType, reconstructLayout, normalizeInformalText } from './metaLayer.service.js';
import {
    translationCache,
    lineTranslationCache,
    createTranslationCacheKey,
    createLineCacheKey,
} from './cache.service.js';
import { translateWithGroq, translateDocumentWithGroq } from './groqTranslation.service.js';

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
 * PRIMARY translation function — Groq-first with HuggingFace/Flask fallback.
 *
 * Speed comparison:
 *   Groq LLM:      ~800ms-1.5s  ← PRIMARY
 *   HF/Flask NLLB: 3-6 minutes  ← FALLBACK only
 *
 * @param {string} text - Text to translate
 * @param {string} sourceLang
 * @param {string} targetLang
 * @param {string|null} targetDialect - Passed to Groq for better dialect-aware output
 * @returns {Promise<string>} Translated text
 */
export const performTranslation = async (text, sourceLang, targetLang, targetDialect = null) => {
    if (!text || !text.trim()) return text;

    // ── Per-line translation cache check ──────────────────────────────────────
    const lineCacheKey = createLineCacheKey(text, sourceLang, targetLang);
    const cachedLine = lineTranslationCache.get(lineCacheKey);
    if (cachedLine !== undefined) {
        console.log(`[Cache] Line cache HIT: "${text.slice(0, 40)}..."`);
        return cachedLine;
    }

    let result = null;

    // ── Step 1: Try HuggingFace (slow) ──────────────────────────────────────
    try {
        const translatedText = await callHuggingFaceTranslation(text, sourceLang, targetLang);
        if (translatedText) result = translatedText;
    } catch (hfError) {
        console.warn('[Translation] HuggingFace failed, falling back to Groq:', hfError.message);
    }

    // ── Step 2: Groq fallback (fast — ~800ms) ──────────────────────────────────────
    if (!result) {
        try {
            result = await translateWithGroq(text, sourceLang, targetLang, targetDialect);
            console.log(`[Translation] Groq: "${text.slice(0, 40)}" → "${result?.slice(0, 40)}"`);
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
            console.error('[Translation] All fallbacks failed:', flaskError.message);
            throw new Error(`Translation failed for: "${text.slice(0, 50)}". All backends unavailable.`);
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

    console.log(`[PreprocessedTranslation] Preprocessing done in ${preprocessResult.metadata?.pipelineMs ?? 0}ms, sending to HuggingFace...`);

    const lines = textForTranslation.split('\n');

    // Translate all lines IN PARALLEL (batched concurrency)
    const lineResults = await parallelTranslateLines(lines, sourceLang, targetLang, targetDialect, TRANSLATION_CONCURRENCY);

    // Reconstruct the exact structure from sorted parallel results
    const finalTranslatedLines = lineResults.map(r => r.finalText);
    const rawNllbOutputs = lineResults.filter(r => r.nllbOutput !== r.finalText || !targetDialect).map(r => r.nllbOutput);

    let wasDialectModified = lineResults.some(r => r.wasModified);
    let allDialectReplacements = lineResults.flatMap(r => r.replacements);

    let finalTranslatedText = finalTranslatedLines.join('\n');
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
export const performTranslationWithBreakdown = async (text, sourceLang, targetLang, targetDialect = null, token = null) => {
    // Step 1-3: Run the existing pipeline (preprocess → NLLB → dialectize)
    const result = await performPreprocessedTranslation(text, sourceLang, targetLang, targetDialect, token);

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
        console.log(`[Cache] Document translation cache HIT — skipping full pipeline (~<10ms)`);
        return cachedResult;
    }

    // Steps 1+2: Run DocType Detection AND Layout Reconstruction concurrently.
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
        // Run docType and preprocessing concurrently since they are independent.
        const [docType, preprocessResult] = await Promise.all([
            docTypePromise,
            preprocessText(text, sourceLang, token),
        ]);

        console.log('[DocPipeline] Step 2 — No spatial data, skipping layout reconstruction');
        console.log('[DocPipeline] Step 3 — Translating...');

        let result;
        let textToTranslate = preprocessResult.canonicalizedText || text;

        if (docType.documentType === 'casual_chat' || 
            docType.toneGuidance?.formality === 'informal' || 
            docType.toneGuidance?.formality === 'colloquial') {
            console.log('[DocPipeline] Step 2.5 — Normalizing informal chat text...');
            textToTranslate = await normalizeInformalText(textToTranslate, sourceLang);
        }

        // Translate lines in parallel — pass isDocument=true to skip full-result caching
        if (withBreakdown) {
            result = await performTranslationWithBreakdown(textToTranslate, sourceLang, targetLang, targetDialect, token);
        } else {
            // Chunk text into larger blocks to reduce API calls to Hugging Face
            const paragraphs = textToTranslate.split('\n');
            const chunks = [];
            let currentChunk = [];
            let currentLen = 0;
            
            for (const para of paragraphs) {
                if (currentLen + para.length > 1000 && currentChunk.length > 0) {
                    chunks.push(currentChunk.join('\n'));
                    currentChunk = [para];
                    currentLen = para.length;
                } else {
                    currentChunk.push(para);
                    currentLen += para.length + 1;
                }
            }
            if (currentChunk.length > 0) chunks.push(currentChunk.join('\n'));

            console.log(`[DocPipeline] Chunked document into ${chunks.length} blocks for Hugging Face to avoid timeout`);
            
            const chunkResults = await parallelTranslateLines(chunks, sourceLang, targetLang, targetDialect, TRANSLATION_CONCURRENCY);
            const finalTranslatedText = chunkResults.map(r => r.finalText).join('\n');
            result = {
                originalText: text,
                canonicalizedText: textToTranslate,
                translatedText: finalTranslatedText,
                preprocessing: {
                    wasModified: preprocessResult.wasModified,
                    replacements: preprocessResult.replacements,
                    sentimentAnalysis: preprocessResult.sentimentAnalysis,
                    metadata: preprocessResult.metadata,
                },
                dialectization: targetDialect ? {
                    wasModified: chunkResults.some(r => r.wasModified),
                    replacements: chunkResults.flatMap(r => r.replacements),
                    targetDialect,
                } : null,
            };
        }

        // Build segments from paragraph breaks in the translated text
        const translatedParagraphs = result.translatedText.split('\n').filter(p => p.trim());
        const translatedSegments = translatedParagraphs.map((para, i) => ({
            index: i,
            sourceText: '', // Can't map back without layout data
            translatedText: para.trim(),
            isHeader: false,
            type: 'paragraph',
        }));

        console.log(`[DocPipeline] Complete in ${Date.now() - pipelineStart}ms`);

        const finalOutput = {
            ...result,
            documentType: docType,
            formattedSourceText: text,
            segments: translatedSegments,
            layoutReconstruction: null,
        };
        translationCache.set(docCacheKey, finalOutput);
        return finalOutput;
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