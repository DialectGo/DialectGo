/**
 * Sentiment Service
 * 
 * Calculates weighted sentiment scores, handles negation flipping,
 * intensifier boosting, and contextual disambiguation for tokens
 * with multiple corpus matches.
 * 
 * Core Formula (Weighted):
 *   Sentiment_sentence = Σ(Score × Weight) / Σ(Weights)
 * 
 * Negation Logic:
 *   If a negator word precedes a scored token (within 2 positions), flip the sign.
 * 
 * Intensifier Logic:
 *   If an intensifier precedes a scored token, multiply its weight by the intensifier multiplier.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sentimentConfig = require('../config/sentiment_categories.json');

const { categories, negators, intensifiers, score_thresholds } = sentimentConfig;

// Build a lookup set for negators
const negatorSet = new Set(negators.map(n => n.toLowerCase()));

// Build a lookup map for intensifiers: word → multiplier
const intensifierMap = new Map(
    Object.entries(intensifiers).map(([word, multiplier]) => [word.toLowerCase(), multiplier])
);

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ResolvedToken
 * @property {string} original
 * @property {string} normalized
 * @property {number} startIndex
 * @property {number} endIndex
 * @property {'word'|'punctuation'|'whitespace'} type
 * @property {Object|null} resolvedMatch - The single best corpus entry selected for this token
 * @property {number} effectiveScore - Final sentiment score after negation/intensifier adjustments
 * @property {number} effectiveWeight - Final weight after intensifier adjustments
 * @property {'keep'|'ignore'|'negator'|'intensifier'} status - Token role in sentiment calculation
 */

/**
 * @typedef {Object} SentimentResult
 * @property {number} overallScore - Weighted average sentiment score for the full text
 * @property {string} overallCategory - Human-readable category (e.g., "positive", "very_negative")
 * @property {ResolvedToken[]} resolvedTokens - All tokens with resolved matches and scores
 * @property {Object} breakdown - Detailed calculation breakdown for debugging
 */

/**
 * Calculate the weighted sentiment score for a set of enriched tokens.
 * Also disambiguates tokens with multiple corpus matches.
 * 
 * @param {import('./corpusLookup.service.js').EnrichedToken[]} enrichedTokens
 * @returns {SentimentResult}
 */
export function calculateSentiment(enrichedTokens) {
    // Step 1: Classify each token's role and disambiguate multi-match tokens
    const resolvedTokens = resolveAllTokens(enrichedTokens);

    // Step 2: Apply negation and intensifier logic
    applyNegationAndIntensifiers(resolvedTokens);

    // Step 3: Calculate weighted average
    let sumScoreTimesWeight = 0;
    let sumWeights = 0;
    const keptTokens = [];

    for (const token of resolvedTokens) {
        if (token.status === 'keep' && token.resolvedMatch) {
            sumScoreTimesWeight += token.effectiveScore * token.effectiveWeight;
            sumWeights += token.effectiveWeight;
            keptTokens.push({
                word: token.original,
                score: token.effectiveScore,
                weight: token.effectiveWeight,
                standardTerm: token.resolvedMatch.standard_term
            });
        }
    }

    const overallScore = sumWeights > 0 ? sumScoreTimesWeight / sumWeights : 0;
    const overallCategory = classifyScore(overallScore);

    return {
        overallScore: Math.round(overallScore * 1000) / 1000, // 3 decimal places
        overallCategory,
        resolvedTokens,
        breakdown: {
            formula: 'Σ(Score × Weight) / Σ(Weights)',
            sumScoreTimesWeight: Math.round(sumScoreTimesWeight * 1000) / 1000,
            sumWeights,
            matchedTokens: keptTokens
        }
    };
}

// ─── Token Resolution ───────────────────────────────────────────────────────

/**
 * Resolve all tokens: assign roles, disambiguate multi-match tokens.
 * 
 * @param {import('./corpusLookup.service.js').EnrichedToken[]} enrichedTokens
 * @returns {ResolvedToken[]}
 */
function resolveAllTokens(enrichedTokens) {
    return enrichedTokens.map((token, index) => {
        // Non-word tokens are always ignored
        if (token.type !== 'word') {
            return {
                ...token,
                resolvedMatch: null,
                effectiveScore: 0,
                effectiveWeight: 0,
                status: 'ignore'
            };
        }

        // Check if this token is a negator
        if (negatorSet.has(token.normalized)) {
            return {
                ...token,
                resolvedMatch: null,
                effectiveScore: 0,
                effectiveWeight: 0,
                status: 'negator'
            };
        }

        // Check if this token is an intensifier
        if (intensifierMap.has(token.normalized)) {
            return {
                ...token,
                resolvedMatch: null,
                effectiveScore: 0,
                effectiveWeight: 0,
                status: 'intensifier'
            };
        }

        // No corpus matches — regular word, ignored in sentiment
        if (!token.corpusMatches || token.corpusMatches.length === 0) {
            return {
                ...token,
                resolvedMatch: null,
                effectiveScore: 0,
                effectiveWeight: 0,
                status: 'ignore'
            };
        }

        // Single match — straightforward
        if (token.corpusMatches.length === 1) {
            const match = token.corpusMatches[0];
            const scoreKey = Number(match.sentiment_score).toFixed(1);
            const category = categories[scoreKey];
            const truePolarity = category && category.polarity !== undefined ? category.polarity : 0;
            return {
                ...token,
                resolvedMatch: match,
                effectiveScore: truePolarity,
                effectiveWeight: match.weight || 1,
                status: 'keep'
            };
        }

        // Multiple matches — disambiguate using context
        const contextWindow = extractContextWindow(enrichedTokens, index, 3);
        const bestMatch = disambiguateToken(token, contextWindow);

        const scoreKey = Number(bestMatch.sentiment_score).toFixed(1);
        const category = categories[scoreKey];
        const truePolarity = category && category.polarity !== undefined ? category.polarity : 0;

        return {
            ...token,
            resolvedMatch: bestMatch,
            effectiveScore: truePolarity,
            effectiveWeight: bestMatch.weight || 1,
            status: 'keep'
        };
    });
}

// ─── Contextual Disambiguation ──────────────────────────────────────────────

/**
 * Extract a context window of ±windowSize word tokens around the target index.
 * 
 * @param {Object[]} tokens - All tokens
 * @param {number} targetIndex - Index of the ambiguous token
 * @param {number} windowSize - Number of word tokens to collect on each side
 * @returns {string[]} Normalized words in the context window
 */
function extractContextWindow(tokens, targetIndex, windowSize) {
    const contextWords = [];

    // Collect words before the target
    let count = 0;
    for (let i = targetIndex - 1; i >= 0 && count < windowSize; i--) {
        if (tokens[i].type === 'word') {
            contextWords.push(tokens[i].normalized);
            count++;
        }
    }

    // Collect words after the target
    count = 0;
    for (let i = targetIndex + 1; i < tokens.length && count < windowSize; i++) {
        if (tokens[i].type === 'word') {
            contextWords.push(tokens[i].normalized);
            count++;
        }
    }

    return contextWords;
}

/**
 * Disambiguate a token with multiple corpus matches.
 * 
 * Algorithm:
 * 1. For each match's sentiment_score, find its category in sentiment_categories.json
 * 2. Count how many context words overlap with that category's keywords
 * 3. The match with the highest keyword overlap wins
 * 4. Tie-break: prefer the match with higher weight
 * 
 * @param {Object} token - The ambiguous enriched token
 * @param {string[]} contextWords - Surrounding words (normalized)
 * @returns {Object} The best corpus match
 */
export function disambiguateToken(token, contextWords) {
    const contextSet = new Set(contextWords);
    let bestMatch = token.corpusMatches[0];
    let bestOverlap = -1;
    let bestWeight = 0;

    for (const match of token.corpusMatches) {
        // Fix: Ensure we always look up "1.0", "2.0", etc., even if JS converts 1.0 to 1
        const scoreKey = Number(match.sentiment_score).toFixed(1);
        const category = categories[scoreKey];
        let overlap = 0;

        if (category && category.keywords) {
            for (const keyword of category.keywords) {
                const lowerKeyword = keyword.toLowerCase();
                for (const contextWord of contextWords) {
                    if (contextWord === lowerKeyword || (lowerKeyword.length >= 4 && contextWord.includes(lowerKeyword))) {
                        overlap++;
                        break; // Count at most once per keyword
                    }
                }
            }
        }

        // Also check context_tag keywords in the corpus entry itself
        if (match.context_tag) {
            const tags = match.context_tag.toLowerCase().split(/[,\s]+/);
            for (const tag of tags) {
                for (const contextWord of contextWords) {
                    if (contextWord === tag || (tag.length >= 4 && contextWord.includes(tag))) {
                        overlap++;
                        break;
                    }
                }
            }
        }

        // Add POS context overlap boost
        if (match.part_of_speech && token.inferredPOS && token.inferredPOS !== 'Unknown') {
            if (match.part_of_speech.toLowerCase() === token.inferredPOS.toLowerCase()) {
                overlap += 2; // Strong boost for grammatical match
            }
        }

        // Compare: prefer higher overlap, then higher weight as tie-break
        if (overlap > bestOverlap || (overlap === bestOverlap && (match.weight || 1) > bestWeight)) {
            bestMatch = match;
            bestOverlap = overlap;
            bestWeight = match.weight || 1;
        }
    }

    return bestMatch;
}

// ─── Negation & Intensifier Logic ───────────────────────────────────────────

/**
 * Apply negation flipping and intensifier boosting to resolved tokens.
 * Modifies tokens in-place.
 * 
 * Rules:
 * - If a negator appears within 2 word positions before a 'keep' token, flip its score sign
 * - If an intensifier appears within 2 word positions before a 'keep' token, multiply its weight
 * 
 * @param {ResolvedToken[]} resolvedTokens
 */
function applyNegationAndIntensifiers(resolvedTokens) {
    // Build an index of only word tokens for positional lookups
    const wordTokenIndices = [];
    for (let i = 0; i < resolvedTokens.length; i++) {
        if (resolvedTokens[i].type === 'word') {
            wordTokenIndices.push(i);
        }
    }

    for (let wi = 0; wi < wordTokenIndices.length; wi++) {
        const tokenIdx = wordTokenIndices[wi];
        const token = resolvedTokens[tokenIdx];

        if (token.status !== 'keep') continue;

        // VSO Predicate Multiplier: In Philippine languages, the first word carries the heaviest emotional weight
        if (token.isPredicate) {
            token.effectiveWeight = Math.round(token.effectiveWeight * 1.5 * 100) / 100;
        }

        // Look at the 2 preceding word tokens
        for (let lookback = 1; lookback <= 2 && (wi - lookback) >= 0; lookback++) {
            const prevIdx = wordTokenIndices[wi - lookback];
            const prevToken = resolvedTokens[prevIdx];

            // Negation: flip the sign of the sentiment score
            if (prevToken.status === 'negator') {
                token.effectiveScore = -token.effectiveScore;
                break; // Only apply one negation
            }

            // Intensifier: boost the weight
            if (prevToken.status === 'intensifier') {
                const multiplier = intensifierMap.get(prevToken.normalized) || 1.5;
                token.effectiveWeight = Math.round(token.effectiveWeight * multiplier * 100) / 100;
                break; // Only apply one intensifier
            }
        }
    }
}

// ─── Score Classification ───────────────────────────────────────────────────

/**
 * Classify a numeric score into a human-readable category.
 * 
 * @param {number} score
 * @returns {string}
 */
function classifyScore(score) {
    for (const [category, [min, max]] of Object.entries(score_thresholds)) {
        if (score >= min && score <= max) {
            return category;
        }
    }
    // Edge cases
    if (score > 1.0) return 'very_positive';
    if (score < -1.0) return 'very_negative';
    return 'neutral';
}

/**
 * Get the sentiment category label for a specific score value.
 * Used for logging/debugging.
 * 
 * @param {number} scoreKey - The category key (e.g., 1.0, 6.0)
 * @returns {string}
 */
export function getCategoryLabel(scoreKey) {
    // Fix: Ensure we format the key to 1 decimal place like "1.0"
    const formattedKey = Number(scoreKey).toFixed(1);
    const category = categories[formattedKey];
    return category ? category.label : 'Unknown';
}
