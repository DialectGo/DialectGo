import { supabase, getAuthClient } from '../config/db.js';

export const TranslationModel = {
    saveHistory: async (userId, data, token) => {
        const client = getAuthClient(token);
        return await client
            .from('translation_history')
            .insert([{
                user_id: userId,
                source_text: data.sourceText,
                translated_text: data.translatedText,
                source_language_id: data.sourceLanguageId,
                target_language_id: data.targetLanguageId
            }])
            .select();
    },

    getHistory: async (userId, token) => {
        const client = getAuthClient(token);
        return await client
            .from('translation_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
    },

    deleteHistory: async (id, userId, token) => {
        const client = getAuthClient(token);
        return await client
            .from('translation_history')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
    },

    saveBookmark: async (userId, translationId, token) => {
        const client = getAuthClient(token);
        return await client
            .from('saved_translations')
            .insert([{ user_id: userId, translation_id: translationId }]);
    },

    addFeedback: async (userId, translationId, rating, comment, token) => {
        const client = getAuthClient(token);
        return await client
            .from('user_feedback')
            .upsert({
                translation_id: translationId, // The Primary Key
                user_id: userId,
                rating: rating,
                comment: comment,
                created_at: new Date().toISOString()
            }, { onConflict: 'translation_id' }); // This handles the UPDATE if the ID exists
    },

    saveUserTranslation: async (userId, data, token) => {
        const client = getAuthClient(token);
        return await client
            .from('user_recommended_translations')
            .insert([{
                user_id: userId,
                source_text: data.sourceText,
                user_translation: data.userTranslation,
                source_language_id: data.sourceLanguageId,
                target_language_id: data.targetLanguageId,
                status: 'pending'
            }])
            .select();
    },

    getUserTranslations: async (filters = {}) => {
        let query = supabase.from('user_recommended_translations').select('*');

        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }

        return await query.order('created_at', { ascending: false });
    }

};