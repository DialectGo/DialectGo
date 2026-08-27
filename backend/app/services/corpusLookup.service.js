/**
 * Corpus Lookup Service
 * 
 * Queries the dialect_corpus table via CorpusModel to enrich tokens
 * with all matching corpus entries (including multiple sentiment variants).
 * Implements in-memory caching with TTL to minimize repeated DB hits.
 */

import { CorpusModel } from '../models/corpus.model.js';

// ─── In-Memory Cache ────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const corpusCache = new Map(); // key: normalized term → value: { entries, timestamp }
const multiWordCache = new Map(); // key: sourceLang|'all' → value: { phrases, timestamp }

/**
 * Check if a cache entry is still valid.
 * @param {Object} entry - Cache entry with `timestamp`
 * @returns {boolean}
 */
function isCacheValid(entry) {
    return entry && (Date.now() - entry.timestamp) < CACHE_TTL_MS;
}

/**
 * Clear all caches. Useful for testing or after corpus updates.
 */
export function clearCache() {
    corpusCache.clear();
    multiWordCache.clear();
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch all multi-word phrases from the corpus for tokenizer use.
 * Results are cached.
 * 
 * @param {string|null} sourceLang - Optional language filter
 * @returns {Promise<string[]>} Lowercased multi-word phrases
 */
export const getMultiWordPhrases = async (sourceLang = null, token = null) => {
    // We could add caching here (e.g., Redis) since this data doesn't change often
    const { data, error } = await CorpusModel.getMultiWordPhrases(sourceLang, token);

    if (error) {
        console.error('[CorpusLookup] Failed to fetch multi-word phrases:', error.message);
        return [];
    }

    return data;
}

/**
 * @typedef {Object} CorpusMatch
 * @property {number} id
 * @property {string} source_text
 * @property {string|null} standard_term
 * @property {number} sentiment_score
 * @property {number} weight
 * @property {string} region
 * @property {string} context_tag
 */

/**
 * @typedef {Object} EnrichedToken
 * @property {string} original
 * @property {string} normalized
 * @property {number} startIndex
 * @property {number} endIndex
 * @property {'word'|'punctuation'|'whitespace'} type
 * @property {CorpusMatch[]|null} corpusMatches - All matching corpus entries, or null if not found
 * @property {boolean} hasMultipleMatches - True if the token has >1 corpus match (ambiguous)
 */

/**
 * Enrich tokens with corpus data by performing a single batch lookup.
 * Each word token gets a `corpusMatches` array (or null if not found).
 * 
 * @param {import('./tokenizer.service.js').Token[]} tokens - Tokenized input
 * @param {string|null} sourceLang - Optional source language filter for corpus queries
 * @returns {Promise<EnrichedToken[]>}
 */
export const lookupTokens = async (tokens, sourceLang = null, token = null) => {
    // 1. Collect unique normalized words that need lookup
    const wordsToLookup = [];
    const cachedResults = new Map();

    for (const token of tokens) {
        if (token.type !== 'word') continue;

        const cached = corpusCache.get(token.normalized);
        if (isCacheValid(cached)) {
            cachedResults.set(token.normalized, cached.entries);
        } else if (!wordsToLookup.includes(token.normalized)) {
            wordsToLookup.push(token.normalized);
        }
    }

    // 2. Batch-fetch uncached terms from the database
    let dbResults = new Map();

    if (wordsToLookup.length > 0) {
        const { data, error } = await CorpusModel.batchLookup(wordsToLookup, sourceLang, token);

        if (error) {
            console.error('[CorpusLookup] Batch lookup failed:', error.message);
        } else {
            // Group results by source_text (lowercased)
            for (const entry of data) {
                const key = entry.source_text.toLowerCase();
                if (!dbResults.has(key)) {
                    dbResults.set(key, []);
                }
                dbResults.get(key).push(entry);
            }

            // Cache the results (including empty results for terms not found)
            for (const term of wordsToLookup) {
                const entries = dbResults.get(term) || [];
                corpusCache.set(term, { entries, timestamp: Date.now() });
            }
        }
    }

    // 3. Merge cached + fresh results and enrich each token
    const enrichedTokens = tokens.map(token => {
        if (token.type !== 'word') {
            return { ...token, corpusMatches: null, hasMultipleMatches: false };
        }

        const matches = cachedResults.get(token.normalized) || dbResults.get(token.normalized) || [];

        return {
            ...token,
            corpusMatches: matches.length > 0 ? matches : null,
            hasMultipleMatches: matches.length > 1
        };
    });

    return enrichedTokens;
}
