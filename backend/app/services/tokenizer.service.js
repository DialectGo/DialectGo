/**
 * Tokenizer Service
 * 
 * Splits user input text into tokens (words, punctuation, whitespace)
 * while preserving original positions for accurate reconstruction.
 * Supports multi-word expression detection from the dialect_corpus.
 */

/**
 * @typedef {Object} Token
 * @property {string} original    - The original text fragment as written by the user
 * @property {string} normalized  - Lowercased version for corpus lookup
 * @property {number} startIndex  - Start position in the original text (inclusive)
 * @property {number} endIndex    - End position in the original text (exclusive)
 * @property {'word'|'punctuation'|'whitespace'} type - Token classification
 */

/**
 * Tokenize input text into an array of typed tokens.
 * Multi-word phrases from the corpus are matched first (greedy, longest-match).
 * 
 * @param {string} text - Raw user input text
 * @param {string[]} multiWordPhrases - Lowercased multi-word phrases from dialect_corpus
 * @returns {Token[]}
 */
export function tokenize(text, multiWordPhrases = []) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    // Step 1: Perform raw tokenization — split into words, punctuation, whitespace
    const rawTokens = rawTokenize(text);

    // Step 2: If there are multi-word phrases, merge applicable consecutive word tokens
    if (multiWordPhrases.length > 0) {
        return mergeMultiWordTokens(rawTokens, multiWordPhrases);
    }

    return rawTokens;
}

/**
 * Raw tokenizer — splits text into word, punctuation, and whitespace tokens
 * using a regex that captures each type separately.
 * 
 * @param {string} text
 * @returns {Token[]}
 */
function rawTokenize(text) {
    const tokens = [];
    // Match: word characters (including Filipino diacritics/accented chars), 
    //        or whitespace runs, or punctuation runs
    const tokenRegex = /[\w\u00C0-\u024F]+|[^\w\s]+|\s+/g;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
        const fragment = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + fragment.length;

        let type = 'word';
        if (/^\s+$/.test(fragment)) {
            type = 'whitespace';
        } else if (/^[^\w\s]+$/.test(fragment)) {
            type = 'punctuation';
        }

        tokens.push({
            original: fragment,
            normalized: fragment.toLowerCase(),
            startIndex,
            endIndex,
            type
        });
    }

    return tokens;
}

/**
 * Merge consecutive word tokens into multi-word tokens when they match
 * known multi-word phrases from the corpus.
 * Uses a greedy longest-match strategy.
 * 
 * @param {Token[]} tokens - Raw tokens from rawTokenize()
 * @param {string[]} phrases - Lowercased multi-word phrases to match against
 * @returns {Token[]}
 */
function mergeMultiWordTokens(tokens, phrases) {
    // Sort phrases by word count descending (longest match first)
    const sortedPhrases = [...phrases].sort((a, b) => {
        return b.split(/\s+/).length - a.split(/\s+/).length;
    });

    // Build a Set for O(1) lookups
    const phraseSet = new Set(sortedPhrases);
    
    // Maximum number of words in any phrase (for sliding window size)
    const maxPhraseWords = sortedPhrases.length > 0
        ? sortedPhrases[0].split(/\s+/).length
        : 1;

    const result = [];
    let i = 0;

    while (i < tokens.length) {
        const token = tokens[i];

        // Only attempt multi-word merging for word tokens
        if (token.type !== 'word') {
            result.push(token);
            i++;
            continue;
        }

        let matched = false;

        // Try to match the longest possible multi-word phrase starting at position i
        for (let windowSize = maxPhraseWords; windowSize >= 2; windowSize--) {
            const wordTokens = [];
            let j = i;

            // Collect `windowSize` word tokens, skipping whitespace between them
            while (j < tokens.length && wordTokens.length < windowSize) {
                if (tokens[j].type === 'word') {
                    wordTokens.push(tokens[j]);
                } else if (tokens[j].type === 'whitespace') {
                    // Skip whitespace between words — expected separator
                } else {
                    // Punctuation breaks the multi-word sequence
                    break;
                }
                j++;
            }

            if (wordTokens.length === windowSize) {
                const candidatePhrase = wordTokens.map(t => t.normalized).join(' ');
                
                if (phraseSet.has(candidatePhrase)) {
                    // Merge into a single multi-word token
                    const mergedOriginal = tokens.slice(i, j).map(t => t.original).join('');
                    result.push({
                        original: mergedOriginal,
                        normalized: candidatePhrase,
                        startIndex: tokens[i].startIndex,
                        endIndex: tokens[j - 1].endIndex,
                        type: 'word'
                    });
                    i = j; // Skip past all merged tokens
                    matched = true;
                    break;
                }
            }
        }

        if (!matched) {
            result.push(token);
            i++;
        }
    }

    return result;
}

/**
 * Extract only word-type tokens (for corpus lookup).
 * 
 * @param {Token[]} tokens
 * @returns {Token[]}
 */
export function getWordTokens(tokens) {
    return tokens.filter(t => t.type === 'word');
}

/**
 * Get unique normalized word values (for batch DB query).
 * 
 * @param {Token[]} tokens
 * @returns {string[]}
 */
export function getUniqueWords(tokens) {
    const words = new Set();
    for (const token of tokens) {
        if (token.type === 'word') {
            words.add(token.normalized);
        }
    }
    return Array.from(words);
}
