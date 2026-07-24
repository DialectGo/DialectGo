import { supabaseAdmin } from '../config/db.js';

/**
 * Data access layer for the dialect_corpus table.
 * Used by the pre-processing pipeline to look up slang/colloquial terms
 * and their standardized equivalents with sentiment scores.
 */
export const CorpusModel = {

    /**
     * Batch-fetch all corpus entries matching an array of normalized terms.
     * Uses Supabase `.in()` to avoid N+1 queries.
     * 
     * @param {string[]} normalizedTerms - Lowercased terms to look up
     * @param {string|null} sourceLang - Optional source language filter (e.g., 'Tagalog')
     * @returns {Promise<{data: object[], error: object|null}>}
     */
    batchLookup: async (normalizedTerms, sourceLang = null) => {
        if (!normalizedTerms || normalizedTerms.length === 0) {
            return { data: [], error: null };
        }

        let query = supabaseAdmin
            .from('dialect_corpus')
            .select('id, source_text, dialect_translation, standard_term, sentiment_score, weight, region, context_tag, status')
            .in('source_text', normalizedTerms)
            .eq('status', 'validated');

        // Optionally filter by source language/region
        if (sourceLang) {
            query = query.eq('region', sourceLang);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[CorpusModel.batchLookup] Supabase error:', error.message);
            return { data: [], error };
        }

        return { data: data || [], error: null };
    },

    /**
     * Fetch all multi-word phrases from the corpus.
     * These are entries where source_text contains a space.
     * Used by the tokenizer to prioritize multi-word expression matching.
     * 
     * @param {string|null} sourceLang - Optional source language filter
     * @returns {Promise<{data: string[], error: object|null}>}
     */
    getMultiWordPhrases: async (sourceLang = null) => {
        let query = supabaseAdmin
            .from('dialect_corpus')
            .select('source_text')
            .like('source_text', '% %')  // Contains at least one space
            .eq('status', 'validated');

        if (sourceLang) {
            query = query.eq('region', sourceLang);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[CorpusModel.getMultiWordPhrases] Supabase error:', error.message);
            return { data: [], error };
        }

        // Return just the phrase strings, lowercased for matching
        const phrases = (data || []).map(row => row.source_text.toLowerCase());
        return { data: phrases, error: null };
    },

    /**
     * Fetch a single corpus entry by exact term and sentiment score.
     * Used for targeted lookups after disambiguation.
     * 
     * @param {string} term - The term to look up
     * @param {number} sentimentScore - The specific sentiment score
     * @returns {Promise<{data: object|null, error: object|null}>}
     */
    getByTermAndScore: async (term, sentimentScore) => {
        const { data, error } = await supabaseAdmin
            .from('dialect_corpus')
            .select('*')
            .eq('source_text', term.toLowerCase())
            .eq('sentiment_score', sentimentScore)
            .eq('status', 'validated')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('[CorpusModel.getByTermAndScore] Supabase error:', error.message);
        }

        return { data: data || null, error };
    }
};
