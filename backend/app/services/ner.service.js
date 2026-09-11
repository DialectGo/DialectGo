import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'openai/gpt-oss-120b'; // Fast model for simple NER

let groqClient = null;

function getGroqClient() {
    if (!groqClient) {
        if (!GROQ_API_KEY) throw new Error('[NER] GROQ_API_KEY not set in .env');
        groqClient = new Groq({ apiKey: GROQ_API_KEY });
    }
    return groqClient;
}

/**
 * Extracts proper nouns (names of people, places, brands) from text using a fast LLM.
 * Returns an array of unique proper nouns.
 */
async function extractProperNouns(text) {
    if (!text || text.trim().length === 0) return [];

    try {
        const client = getGroqClient();
        
        const systemPrompt = `You are a Named Entity Recognition system.
Extract all PROPER NOUNS (names of specific people, specific places, and brand names) from the user's text.
Do NOT extract regular nouns, pronouns, or the first word of a sentence unless it is actually a proper noun.
Return ONLY a comma-separated list of the extracted proper nouns.
If there are no proper nouns, return exactly the word "NONE".`;

        const completion = await client.chat.completions.create({
            model: GROQ_MODEL,
            temperature: 0.0,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
            ],
        });

        const output = completion.choices?.[0]?.message?.content?.trim() || 'NONE';
        
        if (output === 'NONE') return [];

        // Split by comma, trim, and filter out empties
        const entities = output.split(',').map(e => e.trim()).filter(e => e.length > 0);
        
        // Return unique entities, sorted by length descending so we replace longer names first 
        // e.g. "Quezon City" before "Quezon"
        return [...new Set(entities)].sort((a, b) => b.length - a.length);
        
    } catch (error) {
        console.warn('[NER] Entity extraction failed, falling back to no masking:', error.message);
        return [];
    }
}

/**
 * Masks proper nouns in the text with safe placeholder tags.
 * @returns {Promise<{ maskedText: string, entityMap: Record<string, string> }>}
 */
export async function maskProperNouns(text) {
    const entities = await extractProperNouns(text);
    
    if (entities.length === 0) {
        return { maskedText: text, entityMap: {} };
    }

    let maskedText = text;
    const entityMap = {};

    entities.forEach((entity, index) => {
        // Use an XML-like tag which NLLB generally passes through untouched (e.g. <n0>)
        const placeholder = `<n${index}>`;
        entityMap[placeholder] = entity;
        
        // Replace all occurrences of the entity (case-insensitive for safety, but respecting word boundaries)
        const escapedEntity = entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedEntity}\\b`, 'gi');
        
        maskedText = maskedText.replace(regex, placeholder);
    });

    console.log(`[NER] Masked ${entities.length} entities:`, entityMap);
    
    return { maskedText, entityMap };
}

/**
 * Restores the original proper nouns from the masked text.
 */
export function unmaskProperNouns(maskedText, entityMap) {
    if (!entityMap || Object.keys(entityMap).length === 0) return maskedText;

    let restoredText = maskedText;

    // Sort by tag index so <n0> is processed before <n1> etc., preventing partial matches
    const sortedEntries = Object.entries(entityMap).sort((a, b) => {
        const idxA = parseInt(a[0].match(/\d+/)?.[0] ?? '0');
        const idxB = parseInt(b[0].match(/\d+/)?.[0] ?? '0');
        return idxA - idxB;
    });

    for (const [placeholder, entity] of sortedEntries) {
        // Simple, reliable global string replacement.
        // NLLB occasionally adds a space inside tags e.g. < n0 > — handle both variants.
        restoredText = restoredText.split(placeholder).join(entity);
        
        // Also catch NLLB's spaced-out variant: < n0 >
        const index = placeholder.match(/\d+/)?.[0];
        if (index !== undefined) {
            const spacedVariant = `< n${index} >`;
            restoredText = restoredText.split(spacedVariant).join(entity);
        }
    }

    return restoredText;
}
