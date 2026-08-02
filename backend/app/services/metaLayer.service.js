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
const GROQ_MODEL = 'llama-3.3-70b-versatile';

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

// ─── Analysis Prompt Builder ────────────────────────────────────────────────

/**
 * Build the system prompt for the breakdown analysis.
 * Instructs the LLM to return structured JSON only.
 */
function buildAnalysisSystemPrompt() {
    return `You are a Filipino linguistics expert specializing in Tagalog, Cebuano, and regional Philippine dialects (Boholano, Batangeño, etc.).

Your task is to analyze a translation pair and produce a detailed JSON breakdown. You MUST respond with ONLY valid JSON — no markdown, no explanations outside the JSON.

The JSON schema you must follow:
{
  "wordByWord": [
    {
      "sourceWord": "string (the word from the source text)",
      "translatedWord": "string (the corresponding word in the translation)",
      "partOfSpeech": "string (noun, verb, pronoun, adjective, adverb, particle, preposition, conjunction, interjection)",
      "morphology": "string (explain root words, prefixes, suffixes, infixes, reduplication, etc.)",
      "usage": "string (how this word is typically used in conversation)",
      "dialectNote": "string or null (any regional dialect variation worth noting)"
    }
  ],
  "sentimentEvaluation": {
    "detectedTone": "string (e.g., Romantic, Casual, Formal, Angry, Playful, Neutral)",
    "confidenceScore": "number between 0 and 1",
    "explanation": "string (why this tone was detected)",
    "emotionalWeight": "string (light, medium, heavy)"
  },
  "constructionAnalysis": {
    "sentenceStructure": "string (e.g., VSO, SVO, Topic-Comment)",
    "explanation": "string (explain how the sentence is constructed grammatically)",
    "culturalNote": "string or null (any cultural context that affects meaning or usage)"
  },
  "alternativeSuggestions": [
    {
      "text": "string (an alternative translation)",
      "tone": "string (what tone this alternative carries)",
      "explanation": "string (why someone might prefer this alternative)"
    }
  ]
}

Rules:
- Map source words to translated words as closely as possible. If one source word maps to multiple target words (or vice versa), group them.
- For particles (na, pa, nga, ba, etc.) explain their grammatical function.
- If the target language is a dialect (Boholano, Batangeño), note how it differs from the standard form.
- Provide 1-3 alternative suggestions with different tones.
- Keep explanations concise but educational. Assume the reader is a language learner.
- ALWAYS respond in valid JSON only.`;
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

        const completion = await client.chat.completions.create({
            model: GROQ_MODEL,
            max_tokens: 2000,
            temperature: 0.3, // Low temperature for consistent, factual output
            messages: [
                { role: 'system', content: buildAnalysisSystemPrompt() },
                { role: 'user', content: buildAnalysisUserPrompt({ sourceText, translatedText, sourceLang, targetLang, targetDialect, preprocessingMeta }) },
            ],
        });

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

        const completion = await client.chat.completions.create({
            model: GROQ_MODEL,
            max_tokens: 1000,
            temperature: 0.5, // Slightly more creative for customization
            messages: [
                { role: 'system', content: buildCustomizationSystemPrompt() },
                { role: 'user', content: buildCustomizationUserPrompt({ sourceText, translatedText, sourceLang, targetLang, tone, audience, context, style }) },
            ],
        });

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
