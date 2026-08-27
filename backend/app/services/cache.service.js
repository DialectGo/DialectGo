/**
 * Cache Service — In-Memory LRU Cache for Translation Pipeline
 *
 * Caches:
 *   1. Full preprocessed translation results (keyed by input hash)
 *   2. Per-line NLLB translation outputs (keyed by line + lang pair)
 *   3. Multi-word corpus phrases (long TTL, rarely change)
 *
 * Using an LRU (Least-Recently-Used) eviction strategy to cap memory usage.
 */

import { LRUCache } from 'lru-cache';

// ─── Cache Instances ──────────────────────────────────────────────────────────

/**
 * Full translation result cache.
 * Key: hash of (sourceText + sourceLang + targetLang + dialect)
 * Value: full performPreprocessedTranslation() result object
 * Max: 500 entries, TTL: 30 minutes
 */
export const translationCache = new LRUCache({
    max: 500,
    ttl: 30 * 60 * 1000, // 30 minutes
});

/**
 * Per-line NLLB translation cache.
 * Key: `${sourceLang}|${targetLang}|${line}`
 * Value: translated string
 * Max: 2000 entries, TTL: 60 minutes (NLLB outputs are deterministic)
 */
export const lineTranslationCache = new LRUCache({
    max: 2000,
    ttl: 60 * 60 * 1000, // 60 minutes
});

/**
 * Multi-word corpus phrases cache.
 * Key: sourceLang (or 'all')
 * Value: array of phrases
 * TTL: 10 minutes (refreshed when corpus is updated)
 */
export const multiWordPhraseCache = new LRUCache({
    max: 20,
    ttl: 10 * 60 * 1000, // 10 minutes
});

// ─── Key Generation ───────────────────────────────────────────────────────────

/**
 * Create a deterministic cache key for a full translation request.
 * Uses a simple hash to avoid very long cache keys.
 *
 * @param {string} text - Source text
 * @param {string} sourceLang
 * @param {string} targetLang
 * @param {string|null} targetDialect
 * @returns {string} Cache key
 */
export function createTranslationCacheKey(text, sourceLang, targetLang, targetDialect = null) {
    const raw = `${sourceLang}|${targetLang}|${targetDialect ?? ''}|${text}`;
    return simpleHash(raw);
}

/**
 * Create a cache key for a single line translation.
 *
 * @param {string} line - Single line of text
 * @param {string} sourceLang
 * @param {string} targetLang
 * @returns {string} Cache key
 */
export function createLineCacheKey(line, sourceLang, targetLang) {
    return `${sourceLang}|${targetLang}|${line.trim()}`;
}

// ─── Simple String Hash ───────────────────────────────────────────────────────

/**
 * Fast, simple, non-cryptographic string hash (djb2 variant).
 * Good enough for cache keys — not used for security.
 *
 * @param {string} str
 * @returns {string} Hex-like hash string
 */
function simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
        hash = hash >>> 0; // Convert to unsigned 32-bit integer
    }
    return hash.toString(36); // Compact base-36 representation
}

// ─── Cache Stats (for debugging) ─────────────────────────────────────────────

/**
 * Returns cache hit/size statistics for all caches.
 * Useful for logging and debugging.
 */
export function getCacheStats() {
    return {
        translation: {
            size: translationCache.size,
            max: translationCache.max,
        },
        lineTranslation: {
            size: lineTranslationCache.size,
            max: lineTranslationCache.max,
        },
        multiWordPhrase: {
            size: multiWordPhraseCache.size,
            max: multiWordPhraseCache.max,
        },
    };
}

/**
 * Clear all caches. Useful for testing or after major corpus updates.
 */
export function clearAllCaches() {
    translationCache.clear();
    lineTranslationCache.clear();
    multiWordPhraseCache.clear();
    console.log('[Cache] All translation caches cleared.');
}
