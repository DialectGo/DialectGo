import fs from 'fs';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import { TranslationModel } from '../models/translation.model.js';
import FormDataLib from 'form-data';
import { Client } from '@gradio/client';
import { preprocessText } from './preprocessor.service.js';
import { dialectize } from './reverseCanonicalizer.service.js';
import { analyzeTranslation } from './metaLayer.service.js';

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

export const performOCR = async (base64Image) => {
    const { data: { text } } = await Tesseract.recognize(Buffer.from(base64Image, 'base64'), 'eng');
    return text;
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
 * @returns {Promise<{originalText, canonicalizedText, translatedText, preprocessing, dialectization}>}
 */
export const performPreprocessedTranslation = async (text, sourceLang, targetLang, targetDialect = null) => {
    // Step 1: Run the input pre-processing pipeline
    const preprocessResult = await preprocessText(text, sourceLang);

    // Step 2: Send the canonicalized text (or original if unchanged) to NLLB
    const textForTranslation = preprocessResult.canonicalizedText;
    const nllbOutput = await performTranslation(textForTranslation, sourceLang, targetLang);

    // Step 3: If a dialect is selected, run reverse canonicalization on the output
    let finalText = nllbOutput;
    let dialectMeta = null;

    if (targetDialect) {
        const dialectResult = await dialectize(nllbOutput, targetDialect);
        if (dialectResult.wasModified) {
            finalText = dialectResult.dialectText;
        }
        dialectMeta = {
            wasModified: dialectResult.wasModified,
            replacements: dialectResult.replacements,
            targetDialect,
            metadata: dialectResult.metadata
        };
    }

    console.log('[PreprocessedTranslation] Pipeline summary:', {
        wasModified: preprocessResult.wasModified,
        replacements: preprocessResult.replacements.length,
        sentimentScore: preprocessResult.sentimentAnalysis?.overallScore ?? 'N/A',
        pipelineMs: preprocessResult.metadata.pipelineMs,
        dialectized: dialectMeta?.wasModified ?? false,
        targetDialect: targetDialect || 'Standard'
    });

    return {
        originalText: preprocessResult.originalText,
        canonicalizedText: preprocessResult.canonicalizedText,
        translatedText: finalText,
        nllbRawOutput: targetDialect ? nllbOutput : undefined,
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
export const performTranslationWithBreakdown = async (text, sourceLang, targetLang, targetDialect = null) => {
    // Step 1-3: Run the existing pipeline (preprocess → NLLB → dialectize)
    const result = await performPreprocessedTranslation(text, sourceLang, targetLang, targetDialect);

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

export const saveHistory = async (userId, data) => await TranslationModel.saveHistory(userId, data);
export const getHistory = async (userId) => await TranslationModel.getHistory(userId);
export const deleteHistory = async (id, userId) => await TranslationModel.deleteHistory(id, userId);
export const addFeedback = async (userId, tId, rating) => await TranslationModel.addFeedback(userId, tId, rating);
export const submitRecommendation = async (userId, data) => await TranslationModel.saveUserTranslation(userId, data);