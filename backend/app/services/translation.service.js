import fs from 'fs';
import axios from 'axios';
import { extractTextFromBase64 } from './ocr.service.js';
import { TranslationModel } from '../models/translation.model.js';
import FormDataLib from 'form-data';
import { Client } from '@gradio/client';
import { preprocessText } from './preprocessor.service.js';
import { dialectize } from './reverseCanonicalizer.service.js';
import { analyzeTranslation, analyzeDocumentType, reconstructLayout, normalizeInformalText } from './metaLayer.service.js';

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
        const result = await client.predict('/translate', {
            text: String(text || '').trim(),
            audio_path: null,
            source_lang_name: normalizeLanguageName(sourceLang),
            target_lang_name: normalizeLanguageName(targetLang),
        });

        if (Array.isArray(result?.data)) {
            return typeof result.data[1] === 'string' ? result.data[1].trim() : '';
        }
        return '';
    } catch (e) {
        throw e;
    }
};

export const performTranslation = async (text, sourceLang, targetLang) => {
    try {
        const translatedText = await callHuggingFaceTranslation(text, sourceLang, targetLang);

        if (translatedText) {
            return translatedText;
        }
    } catch (error) {
        console.warn('Hugging Face translation failed, falling back to Flask backend:', error.message || error);
    }

    const payload = {
        input: text,
        source_lang: sourceLang,
        target_lang: targetLang
    };

    console.log('Sending to Flask:', payload);

    try {
        const response = await axios.post(`${COLAB_URL}/translate`, payload, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return response.data.translation;
    } catch (error) {
        if (error.response) {
            console.error('Flask Error Details:', error.response.data);
        }
        throw error;
    }
};

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
    // Step 1: Run the input pre-processing pipeline on the full text
    const preprocessResult = await preprocessText(text, sourceLang, token);

    // Step 2: Split by exact newline to strictly preserve structure
    // We process line-by-line because sending \n characters confuses NLLB
    const textForTranslation = preprocessResult.canonicalizedText;
    const lines = textForTranslation.split('\n');
    
    let finalTranslatedLines = [];
    let wasDialectModified = false;
    let allDialectReplacements = [];
    let rawNllbOutputs = [];

    // Step 3: Process each line individually
    for (const line of lines) {
        // If it's an empty line or just spaces, preserve it exactly without translating
        if (line.trim().length === 0) {
            finalTranslatedLines.push(line);
            continue;
        }

        // Translate the clean line
        const nllbOutput = await performTranslation(line, sourceLang, targetLang);
        rawNllbOutputs.push(nllbOutput);

        if (targetDialect) {
            const dialectResult = await dialectize(nllbOutput, targetDialect, token);
            if (dialectResult.wasModified) {
                wasDialectModified = true;
                if (dialectResult.replacements) {
                    allDialectReplacements.push(...dialectResult.replacements);
                }
            }
            finalTranslatedLines.push(dialectResult.dialectText);
        } else {
            finalTranslatedLines.push(nllbOutput);
        }
    }
    
    // Reconstruct the exact structure
    const finalTranslatedText = finalTranslatedLines.join('\n');
    const joinedNllbOutput = rawNllbOutputs.join('\n');

    let dialectMeta = null;
    if (targetDialect) {
        dialectMeta = {
            wasModified: wasDialectModified,
            replacements: allDialectReplacements,
            targetDialect,
            metadata: { pipelineMs: 0 } // aggregate if needed
        };
    }

    console.log('[PreprocessedTranslation] Pipeline summary:', {
        wasModified: preprocessResult.wasModified,
        replacements: preprocessResult.replacements.length,
        sentimentScore: preprocessResult.sentimentAnalysis?.overallScore ?? 'N/A',
        pipelineMs: preprocessResult.metadata.pipelineMs,
        dialectized: wasDialectModified,
        targetDialect: targetDialect || 'Standard',
        chunksProcessed: lines.length
    });

    return {
        originalText: preprocessResult.originalText,
        canonicalizedText: preprocessResult.canonicalizedText,
        translatedText: finalTranslatedText,
        nllbRawOutput: targetDialect ? joinedNllbOutput : undefined,
        preprocessing: {
            wasModified: preprocessResult.wasModified,
            replacements: preprocessResult.replacements,
            sentimentAnalysis: preprocessResult.sentimentAnalysis,
            metadata: preprocessResult.metadata
        },
        dialectization: dialectMeta
    };
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

    // Step 1: Document Type Detection (parallel-safe, runs concurrently with layout)
    console.log('[DocPipeline] Step 1 — Detecting document type...');
    const docTypePromise = analyzeDocumentType(text);

    // Step 2: Layout Reconstruction (only for OCR images with spatial data)
    let layoutResult = null;
    let segmentedSourceText = text;
    let segments = [{ index: 0, text: text, isHeader: false, type: 'paragraph' }];

    if (ocrDetails && ocrDetails.length > 0) {
        console.log('[DocPipeline] Step 2 — Reconstructing layout from OCR spatial data...');
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

        // Step 3: Translate the reconstructed text
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

        return {
            ...translationResult,
            documentType: docType,
            formattedSourceText: segmentedSourceText,
            segments: translatedSegments,
            layoutReconstruction: layoutResult,
            breakdown,
        };
    } else {
        // No OCR spatial data (PDF/DOCX) — skip layout reconstruction
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

        if (withBreakdown) {
            result = await performTranslationWithBreakdown(textToTranslate, sourceLang, targetLang, targetDialect, token);
        } else {
            result = await performPreprocessedTranslation(textToTranslate, sourceLang, targetLang, targetDialect, token, true);
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

        return {
            ...result,
            documentType: docType,
            formattedSourceText: text,
            segments: translatedSegments,
            layoutReconstruction: null,
        };
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