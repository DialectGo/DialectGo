/**
 * Canonicalization Service
 * 
 * Replaces all matched slang/colloquial tokens in the original text
 * with their resolved `standard_term` from the corpus.
 * Preserves original punctuation, spacing, and capitalization patterns.
 */

/**
 * @typedef {Object} CanonicalizationResult
 * @property {string} canonicalizedText - The standardized text ready for NLLB
 * @property {Object[]} replacements - Log of all replacements made
 * @property {boolean} wasModified - Whether any replacements occurred
 */

/**
 * Replace all corpus-matched tokens in the original text with their
 * resolved standard terms.
 * 
 * @param {string} originalText - The raw user input text
 * @param {import('./sentiment.service.js').ResolvedToken[]} resolvedTokens - Tokens with resolved matches
 * @returns {CanonicalizationResult}
 */
export function canonicalize(originalText, resolvedTokens) {
    const replacements = [];

    // Build replacement map: sorted by startIndex descending so we can
    // replace from end to start without messing up indices
    const tokensToReplace = resolvedTokens
        .filter(token => {
            return token.status === 'keep'
                && token.resolvedMatch
                && token.resolvedMatch.standard_term
                && token.resolvedMatch.standard_term.toLowerCase() !== token.normalized;
        })
        .sort((a, b) => b.startIndex - a.startIndex);

    if (tokensToReplace.length === 0) {
        return {
            canonicalizedText: originalText,
            replacements: [],
            wasModified: false
        };
    }

    // Perform replacements from end to start to preserve character indices
    let result = originalText;

    for (const token of tokensToReplace) {
        const standardTerm = token.resolvedMatch.standard_term;
        
        // Preserve the original casing pattern
        const casePreservedTerm = preserveCasing(token.original, standardTerm);

        // Record the replacement for logging/debugging
        replacements.push({
            original: token.original,
            replacement: casePreservedTerm,
            standardTerm: standardTerm,
            sentimentScore: token.resolvedMatch.sentiment_score,
            category: token.resolvedMatch.context_tag,
            position: { start: token.startIndex, end: token.endIndex }
        });

        // Perform the replacement in the text
        result = result.substring(0, token.startIndex) + casePreservedTerm + result.substring(token.endIndex);
    }

    // Reverse the replacements array so it reads start-to-end
    replacements.reverse();

    return {
        canonicalizedText: result,
        replacements,
        wasModified: true
    };
}

/**
 * Preserve the casing pattern of the original word in the replacement.
 * 
 * Patterns:
 * - ALL CAPS: "BET" → "GUSTO"
 * - Title Case: "Bet" → "Gusto"
 * - lowercase: "bet" → "gusto"
 * - Mixed/other: use replacement as-is
 * 
 * @param {string} original - The original token text
 * @param {string} replacement - The standard term to apply casing to
 * @returns {string}
 */
function preserveCasing(original, replacement) {
    if (!original || !replacement) return replacement;

    // ALL CAPS
    if (original === original.toUpperCase() && original !== original.toLowerCase()) {
        return replacement.toUpperCase();
    }

    // Title Case (first letter uppercase, rest lowercase)
    if (
        original[0] === original[0].toUpperCase() &&
        original.slice(1) === original.slice(1).toLowerCase() &&
        original[0] !== original[0].toLowerCase()
    ) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase();
    }

    // Default: return as-is (lowercase in most cases)
    return replacement.toLowerCase();
}
