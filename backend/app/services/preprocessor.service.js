/**
 * Preprocessor Service — Pipeline Orchestrator
 * 
 * Wires together all sub-services into a single pre-processing pipeline:
 *   1. Tokenize → 2. Corpus Lookup → 3. Sentiment Analysis → 4. Canonicalize
 * 
 * Exposes a single `preprocessText()` function to be called by the controller
 * before sending text to the NLLB translation service.
 */

import { tokenize, getUniqueWords } from './tokenizer.service.js';
import { lookupTokens, getMultiWordPhrases } from './corpusLookup.service.js';
import { calculateSentiment } from './sentiment.service.js';
import { canonicalize } from './canonicalization.service.js';

/**
 * @typedef {Object} PreprocessingResult
 * @property {string} originalText - The raw user input
 * @property {string} canonicalizedText - The standardized text for NLLB
 * @property {boolean} wasModified - Whether any slang/colloquial terms were replaced
 * @property {Object} sentimentAnalysis - Full sentiment breakdown
 * @property {Object[]} replacements - List of all word replacements made
 * @property {Object} metadata - Pipeline execution metadata
 */

/**
 * Map incoming UI language labels to the standardized database dialect groups.
 */
function mapDialect(region) {
    if (!region) return 'General Tagalog';
    const lower = region.toLowerCase();
    if (lower.includes('batang')) return 'Batangeño';
    if (lower.includes('bohol')) return 'Boholano';
    if (lower.includes('cebu')) return 'General Cebuano';
    if (lower.includes('english')) return 'English';
    return 'General Tagalog'; // Default for Tagalog, Slang, Bading, etc.
}

/**
 * Run the full pre-processing pipeline on user input text.
 * 
 * @param {string} text - Raw user input text
 * @param {string|null} sourceLang - Source language identifier (e.g., 'Tagalog', 'tl')
 * @param {string|null} token - Auth token for database access
 * @returns {Promise<PreprocessingResult>}
 */
export const preprocessText = async (text, sourceLang = 'Tagalog', token = null) => {
    const startTime = Date.now();
    const dbDialect = mapDialect(sourceLang);

    // Guard: empty/invalid input passes through unchanged
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return {
            originalText: text || '',
            canonicalizedText: text || '',
            wasModified: false,
            sentimentAnalysis: null,
            replacements: [],
            metadata: { 
                pipelineMs: 0, 
                skipped: true, 
                reason: 'Empty or invalid input' 
            }
        };
    }

    try {
        // ─── Stage 1: Tokenization ──────────────────────────────────────
        const multiWordPhrases = await getMultiWordPhrases(dbDialect, token);
        const tokens = tokenize(text, multiWordPhrases);

        // ─── Stage 1.5: POS Inferencing (VSO Structure) ─────────────────
        let isFirstWord = true;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'word') {
                tokens[i].inferredPOS = 'Unknown';
                tokens[i].isPredicate = false;
                
                // 1. VSO Predicate heuristic (first word is usually Verb/Adj)
                if (isFirstWord) {
                    tokens[i].inferredPOS = 'Predicate';
                    tokens[i].isPredicate = true;
                    isFirstWord = false;
                }

                // 2. Noun marker heuristic
                // Follows standard markers or demonstrative/interrogative linkers ending in -ng
                let prevWord = null;
                for (let j = i - 1; j >= 0; j--) {
                    if (tokens[j].type === 'word') {
                        prevWord = tokens[j].normalized;
                        break;
                    }
                }
                const nounMarkers = [
                    'ang', 'ng', 'sa', 'mga', 'yung', 'si', 'ni', 
                    'kaninong', 'anong', 'itong', 'iyong', 'niyang', 'nitong'
                ];
                if (prevWord && nounMarkers.includes(prevWord)) {
                    tokens[i].inferredPOS = 'Noun';
                    tokens[i].isPredicate = false; // Override if it somehow follows a marker
                }
            }
        }

        console.log(`[Preprocessor] Stage 1 — Tokenized ${tokens.length} tokens with POS inferencing`);

        // Quick exit: if no word tokens found, nothing to process
        const uniqueWords = getUniqueWords(tokens);
        if (uniqueWords.length === 0) {
            return {
                originalText: text,
                canonicalizedText: text,
                wasModified: false,
                sentimentAnalysis: null,
                replacements: [],
                metadata: { pipelineMs: Date.now() - startTime, skipped: true, reason: 'No word tokens' }
            };
        }

        // ─── Stage 2: Corpus Lookup ─────────────────────────────────────
        const enrichedTokens = await lookupTokens(tokens, dbDialect, token);

        const matchedCount = enrichedTokens.filter(t => t.corpusMatches !== null).length;
        console.log(`[Preprocessor] Stage 2 — Found ${matchedCount} corpus matches out of ${uniqueWords.length} unique words`);

        // Quick exit: if no corpus matches found, pass through unchanged
        if (matchedCount === 0) {
            return {
                originalText: text,
                canonicalizedText: text,
                wasModified: false,
                sentimentAnalysis: null,
                replacements: [],
                metadata: { 
                    pipelineMs: Date.now() - startTime, 
                    skipped: true, 
                    reason: 'No corpus matches found',
                    tokensAnalyzed: uniqueWords.length
                }
            };
        }

        // ─── Stage 3: Sentiment Quantification ─────────────────────────
        const sentimentResult = calculateSentiment(enrichedTokens);

        console.log(`[Preprocessor] Stage 3 — Overall sentiment: ${sentimentResult.overallScore} (${sentimentResult.overallCategory})`);

        // ─── Stage 4: Canonicalization ──────────────────────────────────
        const canonResult = canonicalize(text, sentimentResult.resolvedTokens);

        console.log(`[Preprocessor] Stage 4 — ${canonResult.wasModified ? `Made ${canonResult.replacements.length} replacement(s)` : 'No replacements needed'}`);

        if (canonResult.wasModified) {
            console.log(`[Preprocessor] Original:      "${text}"`);
            console.log(`[Preprocessor] Canonicalized: "${canonResult.canonicalizedText}"`);
        }

        const pipelineMs = Date.now() - startTime;
        console.log(`[Preprocessor] Pipeline completed in ${pipelineMs}ms`);

        return {
            originalText: text,
            canonicalizedText: canonResult.canonicalizedText,
            wasModified: canonResult.wasModified,
            sentimentAnalysis: {
                overallScore: sentimentResult.overallScore,
                overallCategory: sentimentResult.overallCategory,
                breakdown: sentimentResult.breakdown
            },
            replacements: canonResult.replacements,
            metadata: {
                pipelineMs,
                skipped: false,
                tokensAnalyzed: uniqueWords.length,
                corpusMatchesFound: matchedCount,
                replacementsMade: canonResult.replacements.length
            }
        };

    } catch (error) {
        // On any error, log it and fall through with the original text
        // so the translation can still proceed
        console.error('[Preprocessor] Pipeline error — falling through with original text:', error.message);

        return {
            originalText: text,
            canonicalizedText: text,
            wasModified: false,
            sentimentAnalysis: null,
            replacements: [],
            metadata: {
                pipelineMs: Date.now() - startTime,
                skipped: true,
                reason: `Pipeline error: ${error.message}`,
                error: true
            }
        };
    }
}
