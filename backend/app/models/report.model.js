/**
 * Report Model
 * 
 * Supabase CRUD operations for the `translation_reports` table.
 * Stores LLM Meta-Layer breakdown reports linked to translation history entries.
 */

import { supabase, getAuthClient } from '../config/db.js';

export const ReportModel = {
    /**
     * Save a new breakdown report.
     * 
     * @param {string} userId - The authenticated user's UUID
     * @param {Object} reportData - The report payload
     * @param {number|null} reportData.translationId - Link to translation_history.id
     * @param {string} reportData.sourceText - Original user input
     * @param {string} reportData.translatedText - Final translation output
     * @param {string} reportData.sourceLang - Source language
     * @param {string} reportData.targetLang - Target language
     * @param {string|null} reportData.targetDialect - Optional dialect variant
     * @param {Object} reportData.breakdown - The LLM word-by-word breakdown JSON
     * @param {Object} reportData.sentimentAnalysis - Sentiment evaluation JSON
     * @returns {Promise<{data: object[], error: object|null}>}
     */
    saveReport: async (userId, reportData, token) => {
        const client = getAuthClient(token);
        return await client
            .from('translation_reports')
            .insert([{
                user_id: userId,
                translation_id: reportData.translationId || null,
                source_text: reportData.sourceText,
                translated_text: reportData.translatedText,
                source_lang: reportData.sourceLang,
                target_lang: reportData.targetLang,
                target_dialect: reportData.targetDialect || null,
                breakdown: reportData.breakdown || {},
                sentiment_analysis: reportData.sentimentAnalysis || {},
            }])
            .select();
    },

    /**
     * Save a customization result alongside the original report.
     * 
     * @param {string} reportId - UUID of the existing report to update
     * @param {Object} customizationData - The customization parameters and result
     * @param {Object} customizationData.params - { tone, audience, context, style }
     * @param {string} customizationData.customizedText - The LLM-regenerated text
     * @returns {Promise<{data: object[], error: object|null}>}
     */
    saveCustomization: async (reportId, customizationData, token) => {
        const client = getAuthClient(token);
        return await client
            .from('translation_reports')
            .update({
                customization_params: customizationData.params || {},
                customized_text: customizationData.customizedText,
            })
            .eq('id', reportId)
            .select();
    },

    /**
     * Get a cached report for a specific translation history entry.
     * Returns the most recent report if multiple exist.
     * 
     * @param {number} translationId - The translation_history.id
     * @returns {Promise<{data: object|null, error: object|null}>}
     */
    getReportByTranslationId: async (translationId, token) => {
        const client = getAuthClient(token);
        const { data, error } = await client
            .from('translation_reports')
            .select('*')
            .eq('translation_id', translationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return { data, error };
    },

    /**
     * Get all reports for a user, newest first.
     * 
     * @param {string} userId - The user's UUID
     * @param {number} limit - Max rows to return (default 20)
     * @returns {Promise<{data: object[], error: object|null}>}
     */
    getReportsByUser: async (userId, limit = 20, token) => {
        const client = getAuthClient(token);
        return await client
            .from('translation_reports')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
    },
};
