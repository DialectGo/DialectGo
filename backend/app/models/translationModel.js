import { supabase } from '../config/db.js';

export const TranslationModel = {
    // Create: Save translation to history
    saveHistory: async (userId, data) => {
        const { sourceText, translatedText, sourceLang, targetLang } = data;
        return await supabase
            .from('translations')
            .insert([{ user_id: userId, source_text: sourceText, translated_text: translatedText, source_lang: sourceLang, target_lang: targetLang }])
            .select();
    },

    // Read: Get all history for a user
    getHistory: async (userId) => {
        return await supabase
            .from('translations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
    },

    // Delete: Remove a specific history item
    deleteHistory: async (id, userId) => {
        return await supabase
            .from('translations')
            .delete()
            .eq('id', id)
            .eq('user_id', userId); // Security: ensure user owns the record
    },

    // Saved/Bookmarks: Toggle bookmark
    saveBookmark: async (userId, translationId) => {
        return await supabase
            .from('saved_translations')
            .insert([{ user_id: userId, translation_id: translationId }]);
    },

    // Feedback: Add rating
    addFeedback: async (translationId, rating) => {
        return await supabase
            .from('user_feedback')
            .insert([{ 
                translation_id: translationId, 
                rating: rating, // 1 or 0
                created_at: new Date() 
            }]);
    }
};