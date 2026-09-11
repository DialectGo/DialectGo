/**
 * Meta-Layer Service (LLM Orchestration)
 *
 * Post-translation analysis layer powered by a "Workload Isolation" hybrid
 * routing strategy across two providers, each assigned to the workload it's
 * best suited for:
 *
 *   Gemini 3.6 Flash (@google/genai)  — strict JSON structured outputs.
 *     -> word-by-word grammatical breakdowns, translation customization,
 *        layout reconstruction, segment explanations.
 *
 *   Groq openai/gpt-oss-120b (groq-sdk) — high-speed NL generation / bulk text.
 *     -> Global Wiki AI Assistant, per-submission Dialect Chatbot,
 *        bulk document translation, informal slang normalization.
 *
 * Transforms DialectGo from a simple translator into an active linguistic partner.
 * 
 * Bulk document translation used to be a single request that blocked for
 * the entire chunked-translation run (potentially several minutes for long
 * documents), then returned one large JSON payload. On a mobile client
 * (Expo Go) this is a known crash pattern:
 *   1. Most RN HTTP stacks (OkHttp on Android, NSURLSession on iOS) have a
 *      default socket idle/read timeout well under "a few minutes" — the
 *      connection gets killed mid-flight with no data ever received.
 *   2. Whatever DOES come back is one very large string crossing the RN
 *      bridge in a single frame, which is a common OOM/crash trigger.
 *
 * Fix: bulk translation is now a JOB. `startBulkTranslationJob` returns
 * immediately (sub-second) with a jobId. The client polls
 * `getBulkTranslationJobStatus(jobId)` every few seconds — each poll is a
 * small, fast, independent request, so there's never a long-lived open
 * connection for the OS to kill, and the final payload is only ever
 * returned once, when the job is actually done.
 *
 * The original blocking `translateBulkDocument` function is kept for
 * backward compatibility but is now marked @deprecated — it shares the
 * same core chunk-processing logic via `runBulkTranslationChunks`.
 *
 * Responsibilities:
 * 1. Word-by-word grammatical breakdown of translations           [Gemini]
 * 2. Sentiment & context evaluation                                [Gemini]
 * 3. Sentence construction analysis                                [Gemini]
 * 4. Dynamic tone/audience customization                           [Gemini]
 * 5. Document layout reconstruction from OCR                       [Gemini]
 * 6. On-demand segment explanations                                [Gemini]
 * 7. Global / per-submission wiki chat assistants                  [Groq]
 * 8. Bulk document translation (job-based, chunked)                [Groq]
 * 9. Informal chat-slang normalization                             [Groq]
 *
 * NOTE ON SCOPE: `analyzeDocumentType` (document classification, run before
 * translation) was not in the "Assigned Features" list for either provider
 * in the architecture spec. It's left on Groq here since Groq is the
 * general-purpose/catch-all workload, but it's a small, cheap JSON call that
 * would also fit cleanly on the Gemini path — flag this to confirm before
 * shipping if that assumption is wrong.
 */

import { randomUUID } from 'node:crypto';
import Groq from 'groq-sdk';
import { GoogleGenAI, Type } from '@google/genai';
import { createLogger } from './logger.js';

const logger = createLogger('MetaLayer');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'openai/gpt-oss-120b';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.6-flash';

// Groq (free tier: 8K TPM) — bulk translation chunking defense.
const GROQ_CHUNK_MAX_CHARS = 3000;
const GROQ_CHUNK_DELAY_MS = 4000;
const GROQ_BATCH_SIZE = 1; // sequential only — never parallelize chunk requests

// Timeouts — prevent long hangs on slow provider responses.
const GROQ_TIMEOUT_MS = 35000; // gpt-oss-120b can take 20-30s for breakdown-scale prompts
const GEMINI_TIMEOUT_MS = 45000; // generous enough to cover a full 2s/4s/8s backoff sequence

// Gemini (free tier: 15 RPM) — exponential backoff defense for 429 / 503.
const GEMINI_BACKOFF_RETRIES = 3;
const GEMINI_BACKOFF_BASE_MS = 2000; // 2s, 4s, 8s

// Bulk translation job store — in-memory, single-process.
// NOTE: if this service ever runs multiple instances behind a load balancer,
// this map needs to move to Redis (or similar) so any instance can serve a
// status poll regardless of which instance started the job.
const MAX_BULK_INPUT_CHARS = 50000; // ~15-20 pages of plain text — hard guard against runaway jobs
const JOB_RETENTION_MS = 15 * 60 * 1000; // keep finished jobs around for 15 min so late polls still work
/** @type {Map<string, BulkTranslationJob>} */
const bulkTranslationJobs = new Map();

/**
 * @typedef {Object} BulkTranslationJob
 * @property {string} id
 * @property {'processing'|'done'|'error'|'cancelled'} status
 * @property {number} totalChunks
 * @property {number} completedChunks
 * @property {string[]} translatedChunks
 * @property {boolean} hadFailure
 * @property {boolean} cancelRequested
 * @property {string|null} errorMessage
 * @property {number} createdAt
 * @property {number} updatedAt
 */

let groqClient = null;
let geminiClient = null;

/**
 * Lazily initialize the Groq client.
 * @returns {Groq}
 */
function getGroqClient() {
    if (!groqClient) {
        if (!GROQ_API_KEY) {
            throw new Error('[MetaLayer] GROQ_API_KEY is not set in .env');
        }
        groqClient = new Groq({ apiKey: GROQ_API_KEY });
    }
    return groqClient;
}

/**
 * Lazily initialize the Gemini (@google/genai) client.
 * @returns {GoogleGenAI}
 */
function getGeminiClient() {
    if (!geminiClient) {
        if (!GEMINI_API_KEY) {
            throw new Error('[MetaLayer] GEMINI_API_KEY is not set in .env');
        }
        geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
    return geminiClient;
}

/**
 * Wrap a promise with a timeout. Rejects with a clear error if the promise
 * does not resolve within `ms` milliseconds.
 *
 * @param {Promise} promise
 * @param {number} ms - Timeout in milliseconds
 * @param {string} label - Used in the error message
 * @returns {Promise}
 */
function withTimeout(promise, ms, label = 'LLM call') {
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`[MetaLayer] ${label} timed out after ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeoutPromise]);
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Best-effort extraction of an HTTP-ish status code from a thrown error,
 * across the shapes different SDKs/transports use.
 * @param {any} error
 * @returns {number|null}
 */
function extractStatusCode(error) {
    const candidates = [
        error?.status,
        error?.code,
        error?.response?.status,
        error?.cause?.status,
    ];
    for (const c of candidates) {
        const n = Number(c);
        if (Number.isFinite(n)) return n;
    }
    // Fallback: some transports only surface the code in the message text.
    const match = /\b(429|503)\b/.exec(error?.message || '');
    return match ? Number(match[1]) : null;
}

/**
 * Run a Gemini call with silent exponential backoff on 429 (rate limit) and
 * 503 (service unavailable), per the free-tier (15 RPM) rate-limit defense.
 * Retries at 2s, 4s, 8s before giving up and letting the caller's fallback
 * handling take over.
 *
 * @param {() => Promise<any>} fn - Thunk that performs the Gemini call
 * @param {string} label - Used in log/error messages
 * @returns {Promise<any>}
 */
async function withGeminiBackoff(fn, label = 'Gemini call') {
    let lastError;
    for (let attempt = 0; attempt <= GEMINI_BACKOFF_RETRIES; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const status = extractStatusCode(error);
            const isRetryable = status === 429 || status === 503;
            const attemptsLeft = attempt < GEMINI_BACKOFF_RETRIES;
            if (!isRetryable || !attemptsLeft) {
                throw error;
            }
            const delayMs = GEMINI_BACKOFF_BASE_MS * Math.pow(2, attempt); // 2s, 4s, 8s
            logger.warn(`${label} hit ${status}, retrying`, { attempt: attempt + 1, of: GEMINI_BACKOFF_RETRIES, delayMs });
            await sleep(delayMs);
        }
    }
    throw lastError;
}

/**
 * Call Gemini with a strict JSON schema, backoff, and a timeout. Returns the
 * already-parsed object. `response.text` is guaranteed by the Gemini API to
 * be valid JSON matching `responseSchema`, so no markdown-fence stripping or
 * regex text parsing is used here (per the architecture's implementation rules).
 *
 * @param {Object} params
 * @param {string} params.systemInstruction
 * @param {string} params.prompt
 * @param {Object} params.responseSchema
 * @param {number} [params.maxOutputTokens]
 * @param {number} [params.temperature]
 * @param {string} params.label
 * @returns {Promise<Object>}
 */
async function callGeminiJson({ systemInstruction, prompt, responseSchema, maxOutputTokens = 2000, temperature = 0.3, label }) {
    const client = getGeminiClient();

    const response = await withTimeout(
        withGeminiBackoff(
            () => client.models.generateContent({
                model: GEMINI_MODEL,
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema,
                    maxOutputTokens,
                    temperature,
                },
            }),
            label
        ),
        GEMINI_TIMEOUT_MS,
        label
    );

    const rawText = response?.text;
    if (!rawText) {
        throw new Error('Gemini returned an empty response');
    }

    return JSON.parse(rawText);
}

// ─── Analysis Prompt Builder ────────────────────────────────────────────────

/**
 * Build the system prompt for the breakdown analysis.
 */
function buildAnalysisSystemPrompt() {
    return `You are a Filipino linguistics expert (Tagalog, Cebuano, regional dialects). Analyze the given translation and produce a structured breakdown. Map source to translated words closely. Explain particles (na, pa, nga, ba). Note dialect differences. Provide 1-3 alternatives. Keep explanations concise.`;
}

/**
 * Build the user prompt with the specific translation context.
 */
function buildAnalysisUserPrompt({ sourceText, translatedText, sourceLang, targetLang, targetDialect, preprocessingMeta }) {
    let prompt = `Analyze this translation:

Source (${sourceLang}): "${sourceText}"
Translation (${targetLang}${targetDialect ? ` — ${targetDialect} dialect` : ''}): "${translatedText}"`;

    if (preprocessingMeta?.wasModified) {
        const replacements = preprocessingMeta.replacements || [];
        if (replacements.length > 0) {
            const mappings = replacements.map(r => `"${r.original}" → "${r.replacement}" (${r.contextTag || 'general'})`).join(', ');
            prompt += `\n\nPre-processing applied: The original input contained slang/colloquial terms that were standardized before translation: ${mappings}`;
        }
    }

    if (preprocessingMeta?.sentimentAnalysis) {
        const sa = preprocessingMeta.sentimentAnalysis;
        prompt += `\n\nDetected sentiment category: ${sa.overallCategory || 'neutral'} (score: ${sa.overallScore ?? 'N/A'})`;
    }

    return prompt;
}

const ANALYSIS_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        wordByWord: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    sourceWord: { type: Type.STRING },
                    translatedWord: { type: Type.STRING },
                    partOfSpeech: { type: Type.STRING },
                    morphology: { type: Type.STRING },
                    usage: { type: Type.STRING },
                    dialectNote: { type: Type.STRING, nullable: true },
                },
                required: ['sourceWord', 'translatedWord', 'partOfSpeech', 'morphology', 'usage'],
            },
        },
        sentimentEvaluation: {
            type: Type.OBJECT,
            properties: {
                detectedTone: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
                emotionalWeight: { type: Type.STRING },
            },
            required: ['detectedTone', 'confidenceScore', 'explanation', 'emotionalWeight'],
        },
        constructionAnalysis: {
            type: Type.OBJECT,
            properties: {
                sentenceStructure: { type: Type.STRING },
                explanation: { type: Type.STRING },
                culturalNote: { type: Type.STRING, nullable: true },
            },
            required: ['sentenceStructure', 'explanation'],
        },
        alternativeSuggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    tone: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                },
                required: ['text', 'tone', 'explanation'],
            },
        },
    },
    required: ['wordByWord', 'sentimentEvaluation', 'constructionAnalysis', 'alternativeSuggestions'],
};

// ─── Customization Prompt Builder ───────────────────────────────────────────

function buildCustomizationSystemPrompt() {
    return `You are a Filipino linguistics expert. The user wants to customize a translation to match a specific tone, audience, or style.

Rules:
- Preserve the core meaning of the original translation.
- Adapt vocabulary, particles, and formality level to match the requested tone/audience.
- For elder-appropriate speech: use "po", "opo", respectful pronouns, avoid slang.
- For casual/peer speech: use colloquial forms, contractions, particles like "ba", "naman".
- For flirty: use endearments, softer particles, playful phrasing.
- For formal: use complete words, proper grammar, no contractions.`;
}

function buildCustomizationUserPrompt({ sourceText, translatedText, sourceLang, targetLang, tone, audience, context, style }) {
    let prompt = `Customize this translation:

Original source (${sourceLang}): "${sourceText}"
Current translation (${targetLang}): "${translatedText}"

Customization requests:`;

    if (tone) prompt += `\n- Tone: ${tone}`;
    if (audience) prompt += `\n- Target audience: ${audience}`;
    if (context) prompt += `\n- Context: ${context}`;
    if (style) prompt += `\n- Style: ${style}`;

    if (!tone && !audience && !context && !style) {
        prompt += '\n- Make it sound more natural and conversational.';
    }

    return prompt;
}

const CUSTOMIZATION_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        customizedText: { type: Type.STRING },
        explanation: { type: Type.STRING },
        toneApplied: { type: Type.STRING },
        audienceApplied: { type: Type.STRING },
        changes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    original: { type: Type.STRING },
                    replacement: { type: Type.STRING },
                    reason: { type: Type.STRING },
                },
                required: ['original', 'replacement', 'reason'],
            },
        },
    },
    required: ['customizedText', 'explanation', 'toneApplied', 'audienceApplied', 'changes'],
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Analyze a translation and produce a structured breakdown report. [Gemini]
 *
 * @param {Object} params
 * @param {string} params.sourceText - Original user input
 * @param {string} params.translatedText - Final translation output
 * @param {string} params.sourceLang - Source language
 * @param {string} params.targetLang - Target language
 * @param {string|null} params.targetDialect - Optional dialect variant
 * @param {Object|null} params.preprocessingMeta - Preprocessing pipeline metadata
 * @returns {Promise<Object>} The structured breakdown JSON
 */
export async function analyzeTranslation({ sourceText, translatedText, sourceLang, targetLang, targetDialect, preprocessingMeta }) {
    const startTime = Date.now();

    if (!sourceText || !translatedText || !sourceLang || !targetLang) {
        return buildAnalysisFallback(startTime, new Error('Missing required fields: sourceText, translatedText, sourceLang, and targetLang are all required'));
    }

    try {
        const breakdown = await callGeminiJson({
            systemInstruction: buildAnalysisSystemPrompt(),
            prompt: buildAnalysisUserPrompt({ sourceText, translatedText, sourceLang, targetLang, targetDialect, preprocessingMeta }),
            responseSchema: ANALYSIS_RESPONSE_SCHEMA,
            maxOutputTokens: 2500,
            temperature: 0.3,
            label: 'analyzeTranslation',
        });

        logger.info('Analysis completed', { ms: Date.now() - startTime });

        return {
            success: true,
            ...breakdown,
            metadata: {
                model: GEMINI_MODEL,
                analysisMs: Date.now() - startTime,
            },
        };
    } catch (error) {
        logger.error('Analysis failed', { error: error.message });
        return buildAnalysisFallback(startTime, error);
    }
}

function buildAnalysisFallback(startTime, error) {
    return {
        success: false,
        wordByWord: [],
        sentimentEvaluation: {
            detectedTone: 'Unknown',
            confidenceScore: 0,
            explanation: 'Analysis could not be completed: ' + error.message,
            emotionalWeight: 'unknown',
        },
        constructionAnalysis: {
            sentenceStructure: 'Unknown',
            explanation: 'Analysis could not be completed.',
            culturalNote: null,
        },
        alternativeSuggestions: [],
        metadata: {
            model: GEMINI_MODEL,
            analysisMs: Date.now() - startTime,
            error: error.message,
        },
    };
}

/**
 * Customize a translation based on user-defined tone, audience, context, and style. [Gemini]
 *
 * @param {Object} params
 * @param {string} params.sourceText - Original user input
 * @param {string} params.translatedText - Current translation to customize
 * @param {string} params.sourceLang - Source language
 * @param {string} params.targetLang - Target language
 * @param {string|null} params.tone - e.g., "formal", "casual", "flirty", "respectful"
 * @param {string|null} params.audience - e.g., "elder", "peer", "child", "stranger"
 * @param {string|null} params.context - e.g., "apologizing", "greeting", "asking permission"
 * @param {string|null} params.style - e.g., "poetic", "direct", "humorous"
 * @returns {Promise<Object>} The customization result JSON
 */
export async function customizeTranslation({ sourceText, translatedText, sourceLang, targetLang, tone, audience, context, style }) {
    const startTime = Date.now();

    if (!sourceText || !translatedText || !sourceLang || !targetLang) {
        return {
            success: false,
            customizedText: translatedText || '',
            explanation: 'Customization could not be completed: missing required fields (sourceText, translatedText, sourceLang, targetLang).',
            toneApplied: tone || 'none',
            audienceApplied: audience || 'general',
            changes: [],
            metadata: { model: GEMINI_MODEL, customizationMs: Date.now() - startTime, error: 'invalid_input' },
        };
    }

    try {
        const result = await callGeminiJson({
            systemInstruction: buildCustomizationSystemPrompt(),
            prompt: buildCustomizationUserPrompt({ sourceText, translatedText, sourceLang, targetLang, tone, audience, context, style }),
            responseSchema: CUSTOMIZATION_RESPONSE_SCHEMA,
            maxOutputTokens: 800,
            temperature: 0.5,
            label: 'customizeTranslation',
        });

        logger.info('Customization completed', { ms: Date.now() - startTime });

        return {
            success: true,
            ...result,
            metadata: {
                model: GEMINI_MODEL,
                customizationMs: Date.now() - startTime,
            },
        };
    } catch (error) {
        logger.error('Customization failed', { error: error.message });

        return {
            success: false,
            customizedText: translatedText, // Fall back to original
            explanation: 'Customization could not be completed: ' + error.message,
            toneApplied: tone || 'none',
            audienceApplied: audience || 'general',
            changes: [],
            metadata: {
                model: GEMINI_MODEL,
                customizationMs: Date.now() - startTime,
                error: error.message,
            },
        };
    }
}

// ─── Document Type Detection [Groq — see scope note at top of file] ────────

/**
 * Classify the document type and recommend translation tone/register.
 * Runs BEFORE translation to influence the pipeline's behavior.
 *
 * @param {string} sourceText - Raw extracted text from the document/image
 * @returns {Promise<Object>} Document type classification and tone guidance
 */
export async function analyzeDocumentType(sourceText) {
    const startTime = Date.now();

    if (!sourceText || typeof sourceText !== 'string' || !sourceText.trim()) {
        return buildDocumentTypeFallback(startTime, new Error('sourceText is required'));
    }

    try {
        const client = getGroqClient();

        const completion = await withTimeout(
            client.chat.completions.create({
                model: GROQ_MODEL,
                max_tokens: 300,
                temperature: 0.2,
                messages: [
                    {
                        role: 'system',
                        content: `You are a document classification expert. Analyze the given text and classify its document type. Respond with ONLY valid JSON:
{
  "documentType": "string (one of: academic, legal, medical, culinary, personal_letter, news, technical, casual_chat, religious, government_form, literary, advertisement, other)",
  "displayLabel": "string (human-readable label, e.g., '📄 Academic')",
  "confidence": "number 0-1",
  "toneGuidance": {
    "formality": "string (formal, semi-formal, informal, colloquial)",
    "register": "string",
    "vocabularyNotes": "string"
  },
  "summary": "string (1-2 sentence summary)"
}`
                    },
                    {
                        role: 'user',
                        content: `Classify this document:\n\n"${sourceText.slice(0, 1500)}"\n\nRespond with JSON only.`
                    }
                ],
            }),
            GROQ_TIMEOUT_MS,
            'analyzeDocumentType'
        );

        const rawContent = completion.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error('Empty response from Groq');

        const jsonStr = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(jsonStr);

        logger.info('Document type detected', { documentType: result.documentType, confidence: result.confidence, ms: Date.now() - startTime });

        return { success: true, ...result, metadata: { model: GROQ_MODEL, analysisMs: Date.now() - startTime } };
    } catch (error) {
        logger.error('Document type detection failed', { error: error.message });
        return buildDocumentTypeFallback(startTime, error);
    }
}

function buildDocumentTypeFallback(startTime, error) {
    return {
        success: false,
        documentType: 'other',
        displayLabel: '📄 Document',
        confidence: 0,
        toneGuidance: { formality: 'neutral', register: 'standard', vocabularyNotes: '' },
        summary: '',
        metadata: { model: GROQ_MODEL, analysisMs: Date.now() - startTime, error: error.message },
    };
}

// ─── Informal Text Normalization (For Chat/Slang) [Groq] ───────────────────

/**
 * Normalizes highly informal chat text (abbreviations, elongated words, extreme slang)
 * into standard spelling before passing it to the NLLB translation model.
 *
 * @param {string} sourceText - Raw chat text
 * @param {string} sourceLang - The source language (e.g., 'Tagalog')
 * @returns {Promise<string>} Normalized text
 */
export async function normalizeInformalText(sourceText, sourceLang) {
    const startTime = Date.now();

    if (!sourceText || typeof sourceText !== 'string') {
        return sourceText;
    }

    try {
        const client = getGroqClient();

        const completion = await withTimeout(
            client.chat.completions.create({
                model: GROQ_MODEL,
                max_tokens: 1500,
                temperature: 0.1,
                messages: [
                    {
                        role: 'system',
                        content: `You are a linguistics expert specializing in ${sourceLang} chat slang and abbreviations.
Your task is to take highly informal chat text and normalize the spelling so a standard machine translation model can understand it.

Rules:
1. Fix elongated words (e.g., "preee" -> "pare", "ayunnn" -> "ayun", "sigeee" -> "sige").
2. Expand common chat abbreviations (e.g., "dq" -> "di ko" or "hindi ko", "slmt" -> "salamat").
3. Correct intentional misspellings used in texting.
4. DO NOT translate the text to another language. Keep it in ${sourceLang}.
5. Preserve the exact paragraph spacing, punctuation, and emojis.
6. Return ONLY the normalized text, nothing else. No introductions or explanations.`
                    },
                    {
                        role: 'user',
                        content: sourceText
                    }
                ],
            }),
            GROQ_TIMEOUT_MS,
            'normalizeInformalText'
        );

        const normalized = completion.choices?.[0]?.message?.content?.trim();
        logger.info('Text normalized', { ms: Date.now() - startTime });
        return normalized || sourceText;
    } catch (error) {
        logger.error('Text normalization failed', { error: error.message });
        return sourceText; // Fallback to original text
    }
}

// ─── Layout Reconstruction [Gemini] ─────────────────────────────────────────

const LAYOUT_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        formattedText: { type: Type.STRING },
        segments: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    index: { type: Type.NUMBER },
                    text: { type: Type.STRING },
                    isHeader: { type: Type.BOOLEAN },
                    type: { type: Type.STRING },
                },
                required: ['index', 'text', 'isHeader', 'type'],
            },
        },
    },
    required: ['formattedText', 'segments'],
};

/**
 * Reconstruct document layout from flat OCR text using spatial hints.
 * Converts a wall-of-text into clean Markdown with headers, paragraphs, and lists.
 *
 * @param {string} sourceText - Full extracted text
 * @param {Array} ocrDetails - Per-line OCR detail objects with bounding boxes
 * @param {Object} layoutHints - Paragraph groupings and detected headers from OCR
 * @returns {Promise<Object>} Reconstructed Markdown text and paragraph segments
 */
export async function reconstructLayout(sourceText, ocrDetails, layoutHints) {
    const startTime = Date.now();

    if (!sourceText || typeof sourceText !== 'string' || !sourceText.trim()) {
        return buildLayoutFallback('', startTime, new Error('sourceText is required'));
    }

    try {
        let spatialContext = '';
        if (layoutHints?.paragraphs?.length > 0) {
            spatialContext = '\n\nSpatial layout from OCR (paragraphs detected by vertical gaps):\n';
            layoutHints.paragraphs.forEach((para, i) => {
                const isHeader = layoutHints.detected_headers?.some(h => para.line_indices.includes(h));
                spatialContext += `\n[Paragraph ${i + 1}${isHeader ? ' — LIKELY HEADER' : ''}]: "${para.text}"`;
            });
        }

        const systemInstruction = `You are a document formatting expert. Given raw OCR text and spatial layout hints, reconstruct the text into clean Markdown format.

Rules:
- Preserve ALL original text content exactly — do not add, remove, or rephrase words
- Use # for main headers, ## for subheaders based on spatial hints
- Group text into logical paragraphs separated by blank lines
- Detect and format bullet/numbered lists if present
- Remove OCR artifacts like stray characters or broken words if obvious
- Also return an array of paragraph segments that can be individually translated`;

        const prompt = `Reconstruct this OCR text into structured Markdown:\n\nRaw text: "${sourceText}"${spatialContext}`;

        const result = await callGeminiJson({
            systemInstruction,
            prompt,
            responseSchema: LAYOUT_RESPONSE_SCHEMA,
            maxOutputTokens: 2000,
            temperature: 0.2,
            label: 'reconstructLayout',
        });

        logger.info('Layout reconstructed', { segments: result.segments?.length || 0, ms: Date.now() - startTime });

        return {
            success: true,
            formattedText: result.formattedText || sourceText,
            segments: result.segments?.length ? result.segments : [{ index: 0, text: sourceText, isHeader: false, type: 'paragraph' }],
            metadata: { model: GEMINI_MODEL, reconstructionMs: Date.now() - startTime },
        };
    } catch (error) {
        logger.error('Layout reconstruction failed', { error: error.message });
        return buildLayoutFallback(sourceText, startTime, error);
    }
}

function buildLayoutFallback(sourceText, startTime, error) {
    return {
        success: false,
        formattedText: sourceText,
        segments: [{ index: 0, text: sourceText, isHeader: false, type: 'paragraph' }],
        metadata: { model: GEMINI_MODEL, reconstructionMs: Date.now() - startTime, error: error.message },
    };
}

// ─── Highlight & Ask — Segment Explanation [Gemini] ─────────────────────────

const EXPLAIN_SEGMENT_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        explanation: { type: Type.STRING },
        keyTerms: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING },
                    meaning: { type: Type.STRING },
                    rootWord: { type: Type.STRING, nullable: true },
                    regionalNote: { type: Type.STRING, nullable: true },
                },
                required: ['term', 'meaning'],
            },
        },
        grammarNotes: { type: Type.STRING },
        culturalContext: { type: Type.STRING, nullable: true },
        simplifiedVersion: { type: Type.STRING },
    },
    required: ['explanation', 'keyTerms', 'grammarNotes', 'simplifiedVersion'],
};

/**
 * Generate an on-demand micro-explanation for a specific translated paragraph
 * that the user tapped on in the result modal.
 *
 * @param {Object} params
 * @param {string} params.segment - The specific translated sentence/paragraph the user tapped
 * @param {string} params.fullSourceText - The complete original source text
 * @param {string} params.fullTranslatedText - The complete translated text
 * @param {string} params.sourceLang - Source language
 * @param {string} params.targetLang - Target language
 * @returns {Promise<Object>} Explanation with grammar, roots, and cultural context
 */
export async function explainSegment({ segment, fullSourceText, fullTranslatedText, sourceLang, targetLang }) {
    const startTime = Date.now();

    if (!segment || !fullSourceText || !fullTranslatedText || !sourceLang || !targetLang) {
        return buildExplainSegmentFallback(startTime, new Error('segment, fullSourceText, fullTranslatedText, sourceLang, and targetLang are all required'));
    }

    try {
        const systemInstruction = `You are a Filipino linguistics tutor helping a language learner understand a specific part of a translated document.

The user has tapped on a specific paragraph/sentence in their translated document and wants to understand it better. Cover grammar, meaning, and context; call out key terms with their roots where applicable; note cultural context if relevant; and offer a simpler, more conversational rephrasing.`;

        const prompt = `I'm reading a translated document and I tapped on this part to understand it better:

Tapped segment (${targetLang}): "${segment}"

Full original document (${sourceLang}): "${fullSourceText.slice(0, 1500)}"

Full translation (${targetLang}): "${fullTranslatedText.slice(0, 1500)}"

Explain this segment to me like a tutor would.`;

        const result = await callGeminiJson({
            systemInstruction,
            prompt,
            responseSchema: EXPLAIN_SEGMENT_RESPONSE_SCHEMA,
            maxOutputTokens: 1000,
            temperature: 0.4,
            label: 'explainSegment',
        });

        logger.info('Segment explanation generated', { ms: Date.now() - startTime });

        return {
            success: true,
            ...result,
            metadata: { model: GEMINI_MODEL, explanationMs: Date.now() - startTime },
        };
    } catch (error) {
        logger.error('Segment explanation failed', { error: error.message });
        return buildExplainSegmentFallback(startTime, error);
    }
}

function buildExplainSegmentFallback(startTime, error) {
    return {
        success: false,
        explanation: 'Could not generate an explanation for this segment. Please try again.',
        keyTerms: [],
        grammarNotes: '',
        culturalContext: null,
        simplifiedVersion: '',
        metadata: { model: GEMINI_MODEL, explanationMs: Date.now() - startTime, error: error.message },
    };
}

// ─── Bulk Document Translation [Groq — chunked, sequential, job-based] ─────

/**
 * Split text into sequential chunks no larger than `maxChars`, preferring to
 * break on paragraph or sentence boundaries so chunks don't cut mid-thought.
 *
 * @param {string} text
 * @param {number} maxChars
 * @returns {string[]}
 */
function chunkTextForTranslation(text, maxChars = GROQ_CHUNK_MAX_CHARS) {
    if (text.length <= maxChars) return [text];

    const chunks = [];
    let remaining = text;

    while (remaining.length > maxChars) {
        let splitAt = remaining.lastIndexOf('\n\n', maxChars);
        if (splitAt <= 0) splitAt = remaining.lastIndexOf('. ', maxChars);
        if (splitAt <= 0) splitAt = maxChars; // hard cut as last resort

        chunks.push(remaining.slice(0, splitAt + 1));
        remaining = remaining.slice(splitAt + 1);
    }
    if (remaining.length > 0) chunks.push(remaining);

    return chunks;
}

/**
 * Translate a single chunk via Groq. Throws on failure — caller decides how
 * to handle a failed chunk (the job runner records it and keeps going so one
 * bad chunk doesn't take down an otherwise-successful job).
 *
 * @param {Object} params
 * @param {string} params.chunk
 * @param {string} params.sourceLang
 * @param {string} params.targetLang
 * @param {string|null} params.targetDialect
 * @param {string} params.label - Used in timeout error messages
 * @returns {Promise<string>}
 */
async function translateChunk({ chunk, sourceLang, targetLang, targetDialect, label }) {
    const client = getGroqClient();

    const completion = await withTimeout(
        client.chat.completions.create({
            model: GROQ_MODEL,
            max_tokens: 3000,
            temperature: 0.3,
            messages: [
                {
                    role: 'system',
                    content: `You are a professional ${sourceLang}-to-${targetLang} translator${targetDialect ? `, specializing in the ${targetDialect} dialect` : ''}. Translate the user's text faithfully, preserving tone, meaning, and formatting. Return ONLY the translated text — no notes, no preamble, no markdown fences.`
                },
                { role: 'user', content: chunk },
            ],
        }),
        GROQ_TIMEOUT_MS,
        label
    );

    const translated = completion.choices?.[0]?.message?.content?.trim();
    if (!translated) throw new Error('Empty response from Groq for this chunk');
    return translated;
}

/**
 * Core sequential chunk-processing loop, shared by the job runner and the
 * legacy blocking function below. Respects the free-tier 8K TPM limit via a
 * fixed delay between chunks (BATCH_SIZE = 1, i.e. never parallelized).
 *
 * @param {Object} params
 * @param {string[]} params.chunks
 * @param {string} params.sourceLang
 * @param {string} params.targetLang
 * @param {string|null} params.targetDialect
 * @param {(completedChunks: number, totalChunks: number, chunkText: string) => void} [params.onChunkComplete]
 *   Called synchronously after each chunk (success or recorded failure).
 * @param {() => boolean} [params.isCancelled] - Checked between chunks; stops early if it returns true.
 * @returns {Promise<{ translatedChunks: string[], hadFailure: boolean, cancelled: boolean }>}
 */
async function runBulkTranslationChunks({ chunks, sourceLang, targetLang, targetDialect, onChunkComplete, isCancelled }) {
    const translatedChunks = [];
    let hadFailure = false;

    for (let i = 0; i < chunks.length; i++) {
        if (isCancelled?.()) {
            return { translatedChunks, hadFailure, cancelled: true };
        }

        try {
            const translated = await translateChunk({
                chunk: chunks[i],
                sourceLang,
                targetLang,
                targetDialect,
                label: `bulk translation chunk ${i + 1}/${chunks.length}`,
            });
            translatedChunks.push(translated);
        } catch (error) {
            logger.error('Bulk translation chunk failed', { chunk: i + 1, of: chunks.length, error: error.message });
            hadFailure = true;
            translatedChunks.push(''); // preserve chunk position so gaps are visible/debuggable
        }

        onChunkComplete?.(i + 1, chunks.length, translatedChunks[i]);

        const isLastChunk = i === chunks.length - 1;
        if (!isLastChunk) {
            await sleep(GROQ_CHUNK_DELAY_MS);
        }
    }

    return { translatedChunks, hadFailure, cancelled: false };
}

/**
 * Start a bulk-translation job and return immediately. This is the
 * recommended entry point for document translation from the app — it never
 * holds an HTTP connection open, which is what makes it safe for mobile
 * clients (Expo Go included). Poll `getBulkTranslationJobStatus(jobId)` for
 * progress and the final result.
 *
 * @param {Object} params
 * @param {string} params.sourceText - Full document text to translate
 * @param {string} params.sourceLang - Source language
 * @param {string} params.targetLang - Target language
 * @param {string|null} [params.targetDialect] - Optional dialect variant
 * @returns {{ success: boolean, jobId?: string, totalChunks?: number, reason?: string, message?: string }}
 */
export function startBulkTranslationJob({ sourceText, sourceLang, targetLang, targetDialect = null }) {
    if (!sourceText || typeof sourceText !== 'string' || !sourceText.trim() || !sourceLang || !targetLang) {
        return { success: false, reason: 'invalid_input', message: 'sourceText, sourceLang, and targetLang are required.' };
    }

    if (sourceText.length > MAX_BULK_INPUT_CHARS) {
        return {
            success: false,
            reason: 'input_too_large',
            message: `Document is ${sourceText.length} characters, which exceeds the ${MAX_BULK_INPUT_CHARS} character limit for a single bulk translation job. Split it into smaller documents.`,
        };
    }

    const chunks = chunkTextForTranslation(sourceText, GROQ_CHUNK_MAX_CHARS);
    const jobId = randomUUID();
    const now = Date.now();

    /** @type {BulkTranslationJob} */
    const job = {
        id: jobId,
        status: 'processing',
        totalChunks: chunks.length,
        completedChunks: 0,
        translatedChunks: new Array(chunks.length).fill(''),
        hadFailure: false,
        cancelRequested: false,
        errorMessage: null,
        createdAt: now,
        updatedAt: now,
    };
    bulkTranslationJobs.set(jobId, job);

    logger.info('Bulk translation job started', { jobId, totalChunks: chunks.length });

    // Fire-and-forget: intentionally not awaited. Errors are caught and
    // recorded on the job record — never left as an unhandled rejection.
    runBulkTranslationChunks({
        chunks,
        sourceLang,
        targetLang,
        targetDialect,
        isCancelled: () => job.cancelRequested,
        onChunkComplete: (completed, total, chunkText) => {
            job.completedChunks = completed;
            job.translatedChunks[completed - 1] = chunkText;
            job.updatedAt = Date.now();
        },
    })
        .then(({ hadFailure, cancelled }) => {
            job.hadFailure = hadFailure;
            job.status = cancelled ? 'cancelled' : 'done';
            job.updatedAt = Date.now();
            logger.info('Bulk translation job finished', { jobId, status: job.status, hadFailure, ms: job.updatedAt - job.createdAt });
        })
        .catch((error) => {
            job.status = 'error';
            job.errorMessage = error.message;
            job.updatedAt = Date.now();
            logger.error('Bulk translation job crashed', { jobId, error: error.message });
        })
        .finally(() => {
            scheduleJobCleanup(jobId);
        });

    return { success: true, jobId, totalChunks: chunks.length };
}

/**
 * Poll the status of a bulk-translation job. Designed to be called every
 * few seconds by the client — each call is small and fast regardless of how
 * long the underlying translation is taking.
 *
 * @param {string} jobId
 * @returns {Object} Status snapshot; `translatedText` is only populated once status is 'done'.
 */
export function getBulkTranslationJobStatus(jobId) {
    const job = bulkTranslationJobs.get(jobId);
    if (!job) {
        return { success: false, reason: 'not_found', message: `No job found for id ${jobId}. It may have finished more than ${JOB_RETENTION_MS / 60000} minutes ago and been cleaned up.` };
    }

    const base = {
        success: true,
        jobId: job.id,
        status: job.status,
        progress: { completed: job.completedChunks, total: job.totalChunks },
    };

    if (job.status === 'done' || job.status === 'cancelled') {
        return {
            ...base,
            translatedText: job.translatedChunks.join('\n\n'),
            hadFailure: job.hadFailure,
        };
    }

    if (job.status === 'error') {
        return { ...base, errorMessage: job.errorMessage };
    }

    // Still processing — return what's translated so far so the client can
    // optionally show a live preview instead of a blank progress bar.
    return {
        ...base,
        translatedSoFar: job.translatedChunks.slice(0, job.completedChunks).join('\n\n'),
    };
}

/**
 * Request cancellation of an in-progress job. The current in-flight chunk
 * will still finish (Groq requests aren't abortable mid-call here), but no
 * further chunks will be started.
 *
 * @param {string} jobId
 * @returns {{ success: boolean, message?: string }}
 */
export function cancelBulkTranslationJob(jobId) {
    const job = bulkTranslationJobs.get(jobId);
    if (!job) {
        return { success: false, message: `No job found for id ${jobId}.` };
    }
    if (job.status !== 'processing') {
        return { success: false, message: `Job is already ${job.status}, nothing to cancel.` };
    }
    job.cancelRequested = true;
    return { success: true };
}

/**
 * @param {string} jobId
 */
function scheduleJobCleanup(jobId) {
    setTimeout(() => {
        bulkTranslationJobs.delete(jobId);
    }, JOB_RETENTION_MS).unref?.();
}

/**
 * @deprecated Use `startBulkTranslationJob` + `getBulkTranslationJobStatus`
 * instead. This function blocks for the entire duration of a multi-chunk
 * translation (potentially minutes) and returns one large payload in a
 * single response — that combination is what was causing Expo Go to crash
 * on document translation. Kept only for callers not yet migrated.
 *
 * @param {Object} params
 * @param {string} params.sourceText - Full document text to translate
 * @param {string} params.sourceLang - Source language
 * @param {string} params.targetLang - Target language
 * @param {string|null} [params.targetDialect] - Optional dialect variant
 * @param {(progress: {chunkIndex: number, totalChunks: number}) => void} [params.onChunkProgress]
 * @returns {Promise<Object>} Combined translation result
 */
export async function translateBulkDocument({ sourceText, sourceLang, targetLang, targetDialect, onChunkProgress }) {
    const startTime = Date.now();

    if (!sourceText || typeof sourceText !== 'string' || !sourceText.trim() || !sourceLang || !targetLang) {
        return {
            success: false,
            translatedText: '',
            chunkCount: 0,
            metadata: { model: GROQ_MODEL, totalMs: Date.now() - startTime, error: 'sourceText, sourceLang, and targetLang are required' },
        };
    }

    const chunks = chunkTextForTranslation(sourceText, GROQ_CHUNK_MAX_CHARS);

    if (chunks.length > 3) {
        logger.warn('translateBulkDocument called with a large document on the deprecated blocking path — migrate this caller to startBulkTranslationJob', { totalChunks: chunks.length });
    }

    const { translatedChunks, hadFailure } = await runBulkTranslationChunks({
        chunks,
        sourceLang,
        targetLang,
        targetDialect,
        onChunkComplete: (completed, total) => onChunkProgress?.({ chunkIndex: completed - 1, totalChunks: total }),
    });

    logger.info('Bulk translation (legacy blocking path) completed', { chunks: chunks.length, ms: Date.now() - startTime });

    return {
        success: !hadFailure,
        translatedText: translatedChunks.join('\n\n'),
        chunkCount: chunks.length,
        metadata: {
            model: GROQ_MODEL,
            totalMs: Date.now() - startTime,
            ...(hadFailure ? { error: 'one or more chunks failed to translate — see translatedText for gaps' } : {}),
        },
    };
}

// ─── Wiki Assistant Prompt Builder [Groq — Dialect Chatbot] ────────────────

function buildWikiAssistantSystemPrompt(submission) {
    const typeLabel = submission.type === 'Question' ? 'community question' : 'dialect term';

    return `You are a Filipino linguistics and cultural expert AI assistant embedded in DialectGo, a Philippine dialect learning app. You are helping a user understand a specific ${typeLabel} from the community wiki.

Here is the ${typeLabel} you are helping with:

---
Term/Title: "${submission.source_term}"
Region: ${submission.region}
Category: ${submission.category}
Translation/Meaning: "${submission.translation}"
${submission.usage_example ? `Usage Example: "${submission.usage_example}"` : ''}
${submission.sentiment_tag ? `Tone/Sentiment: ${submission.sentiment_tag}` : ''}
---

Your rules:
- ONLY answer questions related to this specific ${typeLabel}, Philippine dialects, Filipino culture, and language learning.
- If the user asks something completely unrelated (e.g., math, coding, politics), politely redirect them to ask about the term or dialect topics.
- Provide culturally sensitive and respectful answers.
- When giving example sentences, provide both the dialect/Filipino version and an English translation.
- Keep responses concise but educational (2-4 paragraphs max).
- If the user asks for more examples, provide 2-3 natural usage examples with context.
- If the user asks about cultural etiquette (e.g., how to speak to elders), give practical, respectful advice.
- Respond in a warm, friendly, and encouraging tone — the user is learning.
- Do NOT use markdown formatting like **bold** or headers. Use plain text only.`;
}

/**
 * Ask the Wiki AI Assistant a question about a specific submission.
 *
 * @param {Object} params
 * @param {Object} params.submission - The full submission object (source_term, translation, region, etc.)
 * @param {string} params.userMessage - The user's question
 * @param {Array}  params.conversationHistory - Previous messages for multi-turn context
 * @returns {Promise<Object>} The assistant's response
 */
export async function askWikiAssistant({ submission, userMessage, conversationHistory = [] }) {
    const startTime = Date.now();

    if (!submission || !userMessage) {
        return {
            success: false,
            response: 'Sorry, I couldn\'t process your question right now. Please try again in a moment.',
            metadata: { model: GROQ_MODEL, responseMs: Date.now() - startTime, error: 'submission and userMessage are required' },
        };
    }

    try {
        const client = getGroqClient();

        const messages = [
            { role: 'system', content: buildWikiAssistantSystemPrompt(submission) },
            ...conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
            { role: 'user', content: userMessage },
        ];

        const completion = await withTimeout(
            client.chat.completions.create({
                model: GROQ_MODEL,
                max_tokens: 1000,
                temperature: 0.6,
                messages,
            }),
            GROQ_TIMEOUT_MS,
            'askWikiAssistant'
        );

        const rawContent = completion.choices?.[0]?.message?.content;

        if (!rawContent) {
            throw new Error('Groq returned an empty response');
        }

        logger.info('Wiki assistant responded', { ms: Date.now() - startTime });

        return {
            success: true,
            response: rawContent.trim(),
            metadata: {
                model: GROQ_MODEL,
                responseMs: Date.now() - startTime,
                tokensUsed: completion.usage?.total_tokens || null,
            }
        };

    } catch (error) {
        logger.error('Wiki assistant failed', { error: error.message });

        return {
            success: false,
            response: 'Sorry, I couldn\'t process your question right now. Please try again in a moment.',
            metadata: {
                model: GROQ_MODEL,
                responseMs: Date.now() - startTime,
                error: error.message,
            }
        };
    }
}

// ─── Global Wiki Assistant [Groq] ───────────────────────────────────────────

function buildGlobalWikiAssistantSystemPrompt() {
    return `You are DialectGo's Global AI Assistant, a friendly Filipino linguistics and cultural expert.
You are embedded in the DialectWiki feed to help users learn about Philippine dialects (such as Batangueño, Boholano, Cebuano, etc.), Filipino culture, and general translation questions.

Your rules:
- ONLY answer questions related to Philippine languages, dialects, Filipino culture, and language learning.
- If the user asks something completely unrelated (e.g., math, coding, politics), politely redirect them to ask about dialects or cultural topics.
- Provide culturally sensitive and respectful answers.
- When giving example sentences, provide both the dialect/Filipino version and an English translation.
- Keep responses concise but educational (2-4 paragraphs max).
- Respond in a warm, friendly, and encouraging tone — the user is learning.
- Do NOT use markdown formatting like **bold** or headers. Use plain text only.`;
}

/**
 * Ask the Global Wiki AI Assistant a general question.
 *
 * @param {Object} params
 * @param {string} params.userMessage - The user's question
 * @param {Array}  params.conversationHistory - Previous messages for multi-turn context
 * @returns {Promise<Object>} The assistant's response
 */
export async function askGlobalWikiAssistant({ userMessage, conversationHistory = [] }) {
    const startTime = Date.now();

    if (!userMessage) {
        return {
            success: false,
            response: 'Sorry, I couldn\'t process your question right now. Please try again in a moment.',
            metadata: { model: GROQ_MODEL, responseMs: Date.now() - startTime, error: 'userMessage is required' },
        };
    }

    try {
        const client = getGroqClient();

        const messages = [
            { role: 'system', content: buildGlobalWikiAssistantSystemPrompt() },
            ...conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
            { role: 'user', content: userMessage },
        ];

        const completion = await withTimeout(
            client.chat.completions.create({
                model: GROQ_MODEL,
                max_tokens: 1000,
                temperature: 0.6,
                messages,
            }),
            GROQ_TIMEOUT_MS,
            'askGlobalWikiAssistant'
        );

        const rawContent = completion.choices?.[0]?.message?.content;

        if (!rawContent) {
            throw new Error('Groq returned an empty response');
        }

        logger.info('Global Wiki assistant responded', { ms: Date.now() - startTime });

        return {
            success: true,
            response: rawContent.trim(),
            metadata: {
                model: GROQ_MODEL,
                responseMs: Date.now() - startTime,
                tokensUsed: completion.usage?.total_tokens || null,
            }
        };

    } catch (error) {
        logger.error('Global Wiki assistant failed', { error: error.message });

        return {
            success: false,
            response: 'Sorry, I couldn\'t process your question right now. Please try again in a moment.',
            metadata: {
                model: GROQ_MODEL,
                responseMs: Date.now() - startTime,
                error: error.message,
            }
        };
    }
}