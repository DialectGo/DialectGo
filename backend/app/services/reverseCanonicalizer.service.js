/**
 * Reverse Canonicalization Service
 * 
 * Transforms NLLB standardized output into regional dialect words.
 * This is the "output pipeline" counterpart to the input canonicalization.
 * 
 * Input pipeline:  source_text (slang) → standard_term (NLLB-friendly)
 * Output pipeline: standard_term (NLLB output) → dialect_translation (regional dialect)
 * 
 * No sentiment disambiguation is needed here because the user has already
 * selected their target dialect via the radio button UI.
 */

import { CorpusModel } from '../models/corpus.model.js';
import { tokenize, getUniqueWords } from './tokenizer.service.js';

// ─── In-Memory Cache for Reverse Lookups ────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const reverseCache = new Map(); // key: `${term}|${dialect}` → value: { entry, timestamp }

function isCacheValid(entry) {
    return entry && (Date.now() - entry.timestamp) < CACHE_TTL_MS;
}

/**
 * Clear the reverse lookup cache. Useful after corpus updates.
 */
export function clearReverseCache() {
    reverseCache.clear();
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} DialectizeResult
 * @property {string} dialectText - The text with standard words replaced by dialect words
 * @property {Object[]} replacements - Log of all replacements made
 * @property {boolean} wasModified - Whether any replacements occurred
 * @property {Object} metadata - Execution metadata
 */

/**
 * Transform NLLB standardized text into a regional dialect variant.
 * 
 * Algorithm:
 * 1. Tokenize the NLLB output
 * 2. Collect unique word tokens
 * 3. Batch reverse-lookup: find dialect_corpus entries where standard_term matches
 *    and region = targetDialect
 * 4. Replace each matched standard word with its dialect_translation
 * 5. Return the dialectized text
 * 
 * @param {string} text - NLLB standardized output text
 * @param {string} targetDialect - The user-selected dialect (e.g., 'Boholano', 'Batangeño')
 * @returns {Promise<DialectizeResult>}
 */
export async function dialectize(text, targetDialect) {
    const startTime = Date.now();

    // Guard: empty input or no dialect
    if (!text || typeof text !== 'string' || text.trim().length === 0 || !targetDialect) {
        return {
            dialectText: text || '',
            replacements: [],
            wasModified: false,
            metadata: {
                pipelineMs: 0,
                skipped: true,
                reason: !targetDialect ? 'No target dialect specified' : 'Empty input'
            }
        };
    }

    try {
        // Step 1: Tokenize the NLLB output
        const tokens = tokenize(text);
        const uniqueWords = getUniqueWords(tokens);

        if (uniqueWords.length === 0) {
            return {
                dialectText: text,
                replacements: [],
                wasModified: false,
                metadata: { pipelineMs: Date.now() - startTime, skipped: true, reason: 'No word tokens' }
            };
        }

        // Step 2: Check cache and collect uncached terms
        const wordsToLookup = [];
        const cachedResults = new Map();

        for (const word of uniqueWords) {
            const cacheKey = `${word}|${targetDialect}`;
            const cached = reverseCache.get(cacheKey);
            if (isCacheValid(cached)) {
                if (cached.entry) {
                    cachedResults.set(word, cached.entry);
                }
            } else {
                wordsToLookup.push(word);
            }
        }

        // Step 3: Batch reverse-lookup uncached terms
        let dbResults = new Map();

        if (wordsToLookup.length > 0) {
            const { data, error } = await CorpusModel.reverseLookup(wordsToLookup, targetDialect);

            if (error) {
                console.error('[ReverseCanonicalizer] Reverse lookup failed:', error.message);
            } else {
                // Group by standard_term (lowercased)
                for (const entry of data) {
                    const key = entry.standard_term.toLowerCase();
                    // Take the first match per standard_term (no disambiguation needed)
                    if (!dbResults.has(key)) {
                        dbResults.set(key, entry);
                    }
                }

                // Cache results (including misses)
                for (const term of wordsToLookup) {
                    const entry = dbResults.get(term) || null;
                    reverseCache.set(`${term}|${targetDialect}`, { entry, timestamp: Date.now() });
                }
            }
        }

        // Step 4: Build replacement list — merge cached + fresh results
        const allMatches = new Map([...cachedResults, ...dbResults]);

        if (allMatches.size === 0) {
            return {
                dialectText: text,
                replacements: [],
                wasModified: false,
                metadata: {
                    pipelineMs: Date.now() - startTime,
                    skipped: true,
                    reason: 'No dialect mappings found',
                    wordsChecked: uniqueWords.length
                }
            };
        }

        // Step 5: Replace standard words with dialect words (from end to start)
        const tokensToReplace = tokens
            .filter(token => {
                if (token.type !== 'word') return false;
                const match = allMatches.get(token.normalized);
                return match && match.dialect_translation &&
                    match.dialect_translation.toLowerCase() !== token.normalized;
            })
            .sort((a, b) => b.startIndex - a.startIndex);

        if (tokensToReplace.length === 0) {
            return {
                dialectText: text,
                replacements: [],
                wasModified: false,
                metadata: {
                    pipelineMs: Date.now() - startTime,
                    skipped: false,
                    reason: 'Matches found but no replacements needed',
                    wordsChecked: uniqueWords.length,
                    matchesFound: allMatches.size
                }
            };
        }

        let result = text;
        const replacements = [];

        for (const token of tokensToReplace) {
            const match = allMatches.get(token.normalized);
            const dialectWord = match.dialect_translation;
            const casePreserved = preserveCasing(token.original, dialectWord);

            replacements.push({
                original: token.original,
                replacement: casePreserved,
                dialectWord: dialectWord,
                dialect: targetDialect,
                position: { start: token.startIndex, end: token.endIndex }
            });

            result = result.substring(0, token.startIndex) + casePreserved + result.substring(token.endIndex);
        }

        // Reverse so replacements read start-to-end
        replacements.reverse();

        const pipelineMs = Date.now() - startTime;

        console.log(`[ReverseCanonicalizer] Dialectized to ${targetDialect}: ${tokensToReplace.length} replacement(s) in ${pipelineMs}ms`);
        if (tokensToReplace.length > 0) {
            console.log(`[ReverseCanonicalizer] Standard:    "${text}"`);
            console.log(`[ReverseCanonicalizer] Dialectized: "${result}"`);
        }

        return {
            dialectText: result,
            replacements,
            wasModified: true,
            metadata: {
                pipelineMs,
                skipped: false,
                targetDialect,
                wordsChecked: uniqueWords.length,
                matchesFound: allMatches.size,
                replacementsMade: tokensToReplace.length
            }
        };

    } catch (error) {
        console.error('[ReverseCanonicalizer] Pipeline error:', error.message);
        return {
            dialectText: text,
            replacements: [],
            wasModified: false,
            metadata: {
                pipelineMs: Date.now() - startTime,
                skipped: true,
                reason: `Pipeline error: ${error.message}`,
                error: true
            }
        };
    }
}

// ─── Casing Preservation ────────────────────────────────────────────────────

/**
 * Preserve the casing pattern of the original word in the replacement.
 * 
 * @param {string} original - The original token text
 * @param {string} replacement - The dialect word to apply casing to
 * @returns {string}
 */
function preserveCasing(original, replacement) {
    if (!original || !replacement) return replacement;

    // ALL CAPS
    if (original === original.toUpperCase() && original !== original.toLowerCase()) {
        return replacement.toUpperCase();
    }

    // Title Case
    if (
        original[0] === original[0].toUpperCase() &&
        original.slice(1) === original.slice(1).toLowerCase() &&
        original[0] !== original[0].toLowerCase()
    ) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase();
    }

    // Default: lowercase
    return replacement.toLowerCase();
}
