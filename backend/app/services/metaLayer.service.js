/**
 * Meta-Layer Service (LLM Orchestration)
 * 
 * Post-translation analysis layer powered by Groq (Llama 3.3 70B).
 * Transforms DialectGo from a simple translator into an active linguistic partner.
 * 
 * Responsibilities:
 * 1. Word-by-word grammatical breakdown of translations
 * 2. Sentiment & context evaluation
 * 3. Sentence construction analysis
 * 4. Dynamic tone/audience customization
 */

import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'openai/gpt-oss-120b';

// Default LLM timeout — prevents 6-7 min hangs on slow Groq responses
const LLM_TIMEOUT_MS = 35000; // 35 seconds — gpt-oss-120b can take 20-30s for breakdowns

let groqClient = null;

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
 * Wrap a promise with a timeout. Rejects with a clear error if the promise
 * does not resolve within `ms` milliseconds.
 *
 * @param {Promise} promise
 * @param {number} ms - Timeout in milliseconds
 * @param {string} label - Used in the error message
 * @returns {Promise}
 */
function withTimeout(promise, ms = LLM_TIMEOUT_MS, label = 'LLM call') {
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`[MetaLayer] ${label} timed out after ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeoutPromise]);
}

// ─── Analysis Prompt Builder ────────────────────────────────────────────────

/**
 * Build the system prompt for the breakdown analysis.
 * Instructs the LLM to return structured JSON only.
 */
function buildAnalysisSystemPrompt() {
    return `You are a Filipino linguistics expert (Tagalog, Cebuano, regional dialects).
Respond ONLY with valid JSON — no markdown, no text outside the JSON.

Schema:
{
  "wordByWord": [
    {"sourceWord": "string", "translatedWord": "string", "partOfSpeech": "string", "morphology": "string", "usage": "string", "dialectNote": "string or null"}
  ],
  "sentimentEvaluation": {"detectedTone": "string", "confidenceScore": "number 0-1", "explanation": "string", "emotionalWeight": "string"},
  "constructionAnalysis": {"sentenceStructure": "string", "explanation": "string", "culturalNote": "string or null"},
  "alternativeSuggestions": [{"text": "string", "tone": "string", "explanation": "string"}]
}

Rules: Map source to translated words closely. Explain particles (na, pa, nga, ba). Note dialect differences. Provide 1-3 alternatives. Keep explanations concise. ALWAYS respond in valid JSON only.`;
}

/**
 * Build the user prompt with the specific translation context.
 */
function buildAnalysisUserPrompt({ sourceText, translatedText, sourceLang, targetLang, targetDialect, preprocessingMeta }) {
    let prompt = `Analyze this translation:

Source (${sourceLang}): "${sourceText}"
Translation (${targetLang}${targetDialect ? ` — ${targetDialect} dialect` : ''}): "${translatedText}"`;

    // Include preprocessing context if available
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

    prompt += '\n\nRespond with the JSON breakdown only.';
    return prompt;
}

// ─── Customization Prompt Builder ───────────────────────────────────────────

function buildCustomizationSystemPrompt() {
    return `You are a Filipino linguistics expert. The user wants to customize a translation to match a specific tone, audience, or style.

You MUST respond with ONLY valid JSON in this schema:
{
  "customizedText": "string (the rewritten translation)",
  "explanation": "string (explain what you changed and why)",
  "toneApplied": "string (the tone you applied)",
  "audienceApplied": "string (the audience you targeted)",
  "changes": [
    {
      "original": "string (original word/phrase)",
      "replacement": "string (new word/phrase)",
      "reason": "string (why this change was made)"
    }
  ]
}

Rules:
- Preserve the core meaning of the original translation.
- Adapt vocabulary, particles, and formality level to match the requested tone/audience.
- For elder-appropriate speech: use "po", "opo", respectful pronouns, avoid slang.
- For casual/peer speech: use colloquial forms, contractions, particles like "ba", "naman".
- For flirty: use endearments, softer particles, playful phrasing.
- For formal: use complete words, proper grammar, no contractions.
- ALWAYS respond in valid JSON only.`;
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

    prompt += '\n\nRespond with the JSON only.';
    return prompt;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Analyze a translation and produce a structured breakdown report.
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

    try {
        const client = getGroqClient();

        const completion = await withTimeout(
            client.chat.completions.create({
                model: GROQ_MODEL,
                max_tokens: 1200, // Reduced from 2000 — faster, still detailed enough
                temperature: 0.3,
                messages: [
                    { role: 'system', content: buildAnalysisSystemPrompt() },
                    { role: 'user', content: buildAnalysisUserPrompt({ sourceText, translatedText, sourceLang, targetLang, targetDialect, preprocessingMeta }) },
                ],
            }),
            20000,
            'analyzeTranslation'
        );

        const rawContent = completion.choices?.[0]?.message?.content;

        if (!rawContent) {
            throw new Error('Groq returned an empty response');
        }

        // Parse JSON from the response — strip markdown fences if present
        const jsonStr = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const breakdown = JSON.parse(jsonStr);

        console.log(`[MetaLayer] Analysis completed in ${Date.now() - startTime}ms`);

        return {
            success: true,
            ...breakdown,
            metadata: {
                model: GROQ_MODEL,
                analysisMs: Date.now() - startTime,
                tokensUsed: completion.usage?.total_tokens || null,
            }
        };

    } catch (error) {
        console.error('[MetaLayer] Analysis failed:', error.message);

        // Return a graceful fallback instead of crashing
        return {
            success: false,
            wordByWord: [],
            sentimentEvaluation: {
                detectedTone: 'Unknown',
                confidenceScore: 0,
                explanation: 'Analysis could not be completed: ' + error.message,
                emotionalWeight: 'unknown'
            },
            constructionAnalysis: {
                sentenceStructure: 'Unknown',
                explanation: 'Analysis could not be completed.',
                culturalNote: null
            },
            alternativeSuggestions: [],
            metadata: {
                model: GROQ_MODEL,
                analysisMs: Date.now() - startTime,
                error: error.message,
            }
        };
    }
}

/**
 * Customize a translation based on user-defined tone, audience, context, and style.
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

    try {
        const client = getGroqClient();

        const completion = await withTimeout(
            client.chat.completions.create({
                model: GROQ_MODEL,
                max_tokens: 800,
                temperature: 0.5,
                messages: [
                    { role: 'system', content: buildCustomizationSystemPrompt() },
                    { role: 'user', content: buildCustomizationUserPrompt({ sourceText, translatedText, sourceLang, targetLang, tone, audience, context, style }) },
                ],
            }),
            20000,
            'customizeTranslation'
        );

        const rawContent = completion.choices?.[0]?.message?.content;

        if (!rawContent) {
            throw new Error('Groq returned an empty response for customization');
        }

        const jsonStr = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(jsonStr);

        console.log(`[MetaLayer] Customization completed in ${Date.now() - startTime}ms`);

        return {
            success: true,
            ...result,
            metadata: {
                model: GROQ_MODEL,
                customizationMs: Date.now() - startTime,
                tokensUsed: completion.usage?.total_tokens || null,
            }
        };

    } catch (error) {
        console.error('[MetaLayer] Customization failed:', error.message);

        return {
            success: false,
            customizedText: translatedText, // Fall back to original
            explanation: 'Customization could not be completed: ' + error.message,
            toneApplied: tone || 'none',
            audienceApplied: audience || 'general',
            changes: [],
            metadata: {
                model: GROQ_MODEL,
                customizationMs: Date.now() - startTime,
                error: error.message,
            }
        };
    }
}

// ─── Document Type Detection ────────────────────────────────────────────────

/**
 * Classify the document type and recommend translation tone/register.
 * Runs BEFORE translation to influence the pipeline's behavior.
 *
 * @param {string} sourceText - Raw extracted text from the document/image
 * @returns {Promise<Object>} Document type classification and tone guidance
 */
export async function analyzeDocumentType(sourceText) {
    const startTime = Date.now();

    try {
        const client = getGroqClient();

        const completion = await withTimeout(
            client.chat.completions.create({
                model: GROQ_MODEL,
                max_tokens: 300,  // Reduced from 500 — doc type detection needs very little output
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
            15000,
            'analyzeDocumentType'
        );

        const rawContent = completion.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error('Empty response from Groq');

        const jsonStr = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(jsonStr);

        console.log(`[MetaLayer] Document type detected: ${result.documentType} (${result.confidence}) in ${Date.now() - startTime}ms`);

        return { success: true, ...result, metadata: { model: GROQ_MODEL, analysisMs: Date.now() - startTime } };
    } catch (error) {
        console.error('[MetaLayer] Document type detection failed:', error.message);
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
}

// ─── Informal Text Normalization (For Chat/Slang) ──────────────────────────

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
    try {
        const client = getGroqClient();

        const completion = await client.chat.completions.create({
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
        });

        const normalized = completion.choices?.[0]?.message?.content?.trim();
        console.log(`[MetaLayer] Text normalized in ${Date.now() - startTime}ms`);
        return normalized || sourceText;
    } catch (error) {
        console.error('[MetaLayer] Text normalization failed:', error.message);
        return sourceText; // Fallback to original text
    }
}

// ─── Layout Reconstruction ──────────────────────────────────────────────────

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

    try {
        const client = getGroqClient();

        // Build spatial context for the LLM
        let spatialContext = '';
        if (layoutHints?.paragraphs?.length > 0) {
            spatialContext = '\n\nSpatial layout from OCR (paragraphs detected by vertical gaps):\n';
            layoutHints.paragraphs.forEach((para, i) => {
                const isHeader = layoutHints.detected_headers?.some(h => para.line_indices.includes(h));
                spatialContext += `\n[Paragraph ${i + 1}${isHeader ? ' — LIKELY HEADER' : ''}]: "${para.text}"`;
            });
        }

        const completion = await client.chat.completions.create({
            model: GROQ_MODEL,
            max_tokens: 2000,
            temperature: 0.2,
            messages: [
                {
                    role: 'system',
                    content: `You are a document formatting expert. Given raw OCR text and spatial layout hints, reconstruct the text into clean Markdown format. 

Rules:
- Preserve ALL original text content exactly — do not add, remove, or rephrase words
- Use # for main headers, ## for subheaders based on spatial hints
- Group text into logical paragraphs separated by blank lines
- Detect and format bullet/numbered lists if present
- Remove OCR artifacts like stray characters or broken words if obvious
- Return ONLY the formatted Markdown text, nothing else
- Also return a JSON array of paragraph segments that can be individually translated

Respond with ONLY valid JSON:
{
  "formattedText": "string (the reconstructed Markdown text)",
  "segments": [
    {
      "index": "number",
      "text": "string (one logical paragraph/section)",
      "isHeader": "boolean",
      "type": "string (header, paragraph, list_item, caption)"
    }
  ]
}`
                },
                {
                    role: 'user',
                    content: `Reconstruct this OCR text into structured Markdown:\n\nRaw text: "${sourceText}"${spatialContext}\n\nRespond with JSON only.`
                }
            ],
        });

        const rawContent = completion.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error('Empty response from Groq');

        const jsonStr = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(jsonStr);

        console.log(`[MetaLayer] Layout reconstructed: ${result.segments?.length || 0} segments in ${Date.now() - startTime}ms`);

        return {
            success: true,
            formattedText: result.formattedText || sourceText,
            segments: result.segments || [{ index: 0, text: sourceText, isHeader: false, type: 'paragraph' }],
            metadata: { model: GROQ_MODEL, reconstructionMs: Date.now() - startTime },
        };
    } catch (error) {
        console.error('[MetaLayer] Layout reconstruction failed:', error.message);
        // Fallback: treat entire text as a single paragraph
        return {
            success: false,
            formattedText: sourceText,
            segments: [{ index: 0, text: sourceText, isHeader: false, type: 'paragraph' }],
            metadata: { model: GROQ_MODEL, reconstructionMs: Date.now() - startTime, error: error.message },
        };
    }
}

// ─── Highlight & Ask — Segment Explanation ──────────────────────────────────

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

    try {
        const client = getGroqClient();

        const completion = await client.chat.completions.create({
            model: GROQ_MODEL,
            max_tokens: 1000,
            temperature: 0.4,
            messages: [
                {
                    role: 'system',
                    content: `You are a Filipino linguistics tutor helping a language learner understand a specific part of a translated document.

The user has tapped on a specific paragraph/sentence in their translated document and wants to understand it better.

Respond with ONLY valid JSON:
{
  "explanation": "string (2-3 paragraph plain-text explanation covering grammar, meaning, and context)",
  "keyTerms": [
    {
      "term": "string (a key word/phrase from the segment)",
      "meaning": "string (what it means)",
      "rootWord": "string or null (linguistic root if applicable)",
      "regionalNote": "string or null (regional usage note)"
    }
  ],
  "grammarNotes": "string (brief grammar breakdown: sentence structure, verb forms, particles)",
  "culturalContext": "string or null (any cultural significance or etiquette notes)",
  "simplifiedVersion": "string (a simpler, more conversational way to say the same thing)"
}`
                },
                {
                    role: 'user',
                    content: `I'm reading a translated document and I tapped on this part to understand it better:

Tapped segment (${targetLang}): "${segment}"

Full original document (${sourceLang}): "${fullSourceText.slice(0, 1500)}"

Full translation (${targetLang}): "${fullTranslatedText.slice(0, 1500)}"

Explain this segment to me like a tutor would. Respond with JSON only.`
                }
            ],
        });

        const rawContent = completion.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error('Empty response from Groq');

        const jsonStr = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(jsonStr);

        console.log(`[MetaLayer] Segment explanation generated in ${Date.now() - startTime}ms`);

        return {
            success: true,
            ...result,
            metadata: { model: GROQ_MODEL, explanationMs: Date.now() - startTime },
        };
    } catch (error) {
        console.error('[MetaLayer] Segment explanation failed:', error.message);
        return {
            success: false,
            explanation: 'Could not generate an explanation for this segment. Please try again.',
            keyTerms: [],
            grammarNotes: '',
            culturalContext: null,
            simplifiedVersion: '',
            metadata: { model: GROQ_MODEL, explanationMs: Date.now() - startTime, error: error.message },
        };
    }
}

// ─── Wiki Assistant Prompt Builder ──────────────────────────────────────────

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

    try {
        const client = getGroqClient();

        // Build messages array with conversation history for multi-turn
        const messages = [
            { role: 'system', content: buildWikiAssistantSystemPrompt(submission) },
            ...conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
            { role: 'user', content: userMessage },
        ];

        const completion = await client.chat.completions.create({
            model: GROQ_MODEL,
            max_tokens: 1000,
            temperature: 0.6,
            messages,
        });

        const rawContent = completion.choices?.[0]?.message?.content;

        if (!rawContent) {
            throw new Error('Groq returned an empty response');
        }

        console.log(`[MetaLayer] Wiki assistant responded in ${Date.now() - startTime}ms`);

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
        console.error('[MetaLayer] Wiki assistant failed:', error.message);

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

// ─── Global Wiki Assistant ──────────────────────────────────────────────────

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

        const completion = await client.chat.completions.create({
            model: GROQ_MODEL,
            max_tokens: 1000,
            temperature: 0.6,
            messages,
        });

        const rawContent = completion.choices?.[0]?.message?.content;

        if (!rawContent) {
            throw new Error('Groq returned an empty response');
        }

        console.log(`[MetaLayer] Global Wiki assistant responded in ${Date.now() - startTime}ms`);

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
        console.error('[MetaLayer] Global Wiki assistant failed:', error.message);

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

