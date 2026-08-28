/**
 * Groq Translation Service
 *
 * Uses Groq's LLM (openai/gpt-oss-120b) as the PRIMARY translation engine.
 * Groq responds in 800ms-1.5s, vs HuggingFace NLLB which takes 3-6 minutes due to
 * cold starts and free-tier throttling.
 *
 * Architecture:
 *   1. Groq LLM (PRIMARY) — ~800ms-1.5s, excellent Tagalog/Cebuano quality
 *   2. HuggingFace/Flask (FALLBACK) — only if Groq fails/rate-limited
 *
 * The LLM is specialized with a linguistic system prompt so it produces
 * natural, culturally-accurate translations — not just literal word-for-word output.
 */

import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_TRANSLATION_MODEL = 'openai/gpt-oss-120b';

// Max chars to translate in a single Groq call before chunking
const GROQ_CHUNK_CHAR_LIMIT = 3000;

let groqTranslationClient = null;

function getGroqTranslationClient() {
    if (!groqTranslationClient) {
        if (!GROQ_API_KEY) throw new Error('[GroqTranslation] GROQ_API_KEY not set in .env');
        groqTranslationClient = new Groq({ apiKey: GROQ_API_KEY });
    }
    return groqTranslationClient;
}

// ─── Language display names ───────────────────────────────────────────────────

const LANG_DISPLAY = {
    en: 'English', english: 'English',
    ceb: 'Cebuano', cebuano: 'Cebuano',
    fil: 'Filipino/Tagalog', tl: 'Filipino/Tagalog', tagalog: 'Filipino/Tagalog', tag: 'Filipino/Tagalog',
};

function getLangDisplay(lang) {
    const key = String(lang || '').trim().toLowerCase();
    return LANG_DISPLAY[key] || lang || 'English';
}

// ─── Groq translation (primary) ───────────────────────────────────────────────

/**
 * Translate text using Groq LLM. 
 * Returns the translated string in ~800ms-1.5s.
 *
 * @param {string} text
 * @param {string} sourceLang
 * @param {string} targetLang
 * @param {string|null} targetDialect - Optional dialect note for better output
 * @returns {Promise<string>}
 */
export async function translateWithGroq(text, sourceLang, targetLang, targetDialect = null) {
    if (!text || !text.trim()) return '';

    const client = getGroqTranslationClient();
    const src = getLangDisplay(sourceLang);
    const tgt = getLangDisplay(targetLang);
    const dialectNote = targetDialect ? ` (${targetDialect} dialect variant)` : '';

    const systemPrompt = `You are an expert Filipino linguist and translator specializing in Tagalog, Cebuano, and regional Philippine dialects.

Your task: Translate the given text from ${src} to ${tgt}${dialectNote}.

Rules:
- Return ONLY the translated text. No explanations, no notes, no preambles.
- Preserve the original paragraph structure and line breaks exactly.
- Use natural, fluent ${tgt} — not word-for-word literal translation.
- For Filipino dialects: use culturally appropriate vocabulary for ${targetDialect || 'standard'} usage.
- Preserve proper nouns, names, and brand names as-is.
- If the text contains mixed languages (code-switching), translate the ${src} parts only.
- Do NOT add markdown formatting like ** or ## unless the original had them.`;

    const completion = await client.chat.completions.create({
        model: GROQ_TRANSLATION_MODEL,
        max_tokens: Math.min(4096, Math.ceil(text.length * 1.5) + 100),
        temperature: 0.1, // Very low — we want consistent, accurate translations
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
        ],
    });

    const translated = completion.choices?.[0]?.message?.content?.trim();
    if (!translated) throw new Error('Groq returned empty translation');

    return translated;
}

/**
 * Translate a large document by chunking it into paragraph groups.
 * Each chunk is ≤ GROQ_CHUNK_CHAR_LIMIT chars and sent as a single Groq call.
 * Chunks are processed in parallel (up to 3 concurrent) for maximum speed.
 *
 * @param {string} fullText - Full document text (may be very long)
 * @param {string} sourceLang
 * @param {string} targetLang
 * @param {string|null} targetDialect
 * @returns {Promise<string>} Full translated text with original structure preserved
 */
export async function translateDocumentWithGroq(fullText, sourceLang, targetLang, targetDialect = null) {
    const paragraphs = fullText.split('\n');
    const chunks = [];
    let currentChunk = [];
    let currentLen = 0;

    // Group paragraphs into chunks under the char limit
    for (const para of paragraphs) {
        if (currentLen + para.length > GROQ_CHUNK_CHAR_LIMIT && currentChunk.length > 0) {
            chunks.push(currentChunk.join('\n'));
            currentChunk = [para];
            currentLen = para.length;
        } else {
            currentChunk.push(para);
            currentLen += para.length + 1;
        }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk.join('\n'));

    console.log(`[GroqTranslation] Splitting document into ${chunks.length} chunk(s) for parallel translation`);

    // Translate chunks in parallel batches of 3
    const BATCH_SIZE = 3;
    const translatedChunks = new Array(chunks.length);

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
            batch.map((chunk, batchIdx) =>
                translateWithGroq(chunk, sourceLang, targetLang, targetDialect)
                    .then(result => ({ index: i + batchIdx, result }))
            )
        );
        batchResults.forEach(({ index, result }) => { translatedChunks[index] = result; });
        console.log(`[GroqTranslation] Completed chunks ${i + 1}-${Math.min(i + BATCH_SIZE, chunks.length)} of ${chunks.length}`);
    }

    return translatedChunks.join('\n');
}
