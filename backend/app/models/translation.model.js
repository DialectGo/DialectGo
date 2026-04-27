import { supabase } from '../config/db.js';

export const TranslationModel = {
    saveHistory: async (userId, data) => {
        return await supabase
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

    getHistory: async (userId) => {
        return await supabase
            .from('translation_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
    },

    deleteHistory: async (id, userId) => {
        return await supabase
            .from('translation_history')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
    },

    saveBookmark: async (userId, translationId) => {
        return await supabase
            .from('saved_translations')
            .insert([{ user_id: userId, translation_id: translationId }]);
    },

    addFeedback: async (userId, translationId, rating) => {
        return await supabase
            .from('user_feedback')
            .insert([{ 
                user_id: userId,
                translation_id: translationId, 
                rating: rating
            }]);
    },

    saveUserTranslation: async (userId, data) => {
        return await supabase
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