import { supabaseAdmin } from '../config/db.js';

export const TranslationModel = {
    // Create: Save translation to history
    saveHistory: async (userId, data) => {
        const { sourceText, translatedText, sourceLanguageId, targetLanguageId } = data;
        return await supabaseAdmin
            .from('translation_history')
            .insert([{
                user_id: userId,
                source_text: sourceText,
                translated_text: translatedText,
                source_language_id: sourceLanguageId,
                target_language_id: targetLanguageId
            }])
            .select();
    },

    // Read: Get all history for a user
    getHistory: async (userId) => {
        return await supabaseAdmin
            .from('translation_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
    },

    // Delete: Remove a specific history item
    deleteHistory: async (id, userId) => {
        return await supabaseAdmin
            .from('translation_history')
            .delete()
            .eq('id', id)
            .eq('user_id', userId); // Security: ensure user owns the record
    },

    // Saved/Bookmarks: Toggle bookmark
    saveBookmark: async (userId, translationId) => {
        return await supabaseAdmin
            .from('saved_translations')
            .insert([{ user_id: userId, translation_id: translationId }]);
    },

    // Feedback: Add rating
    addFeedback: async (userId, translationId, rating) => {
        return await supabaseAdmin
            .from('user_feedback')
            .insert([{ 
                user_id: userId,
                translation_id: translationId, 
                rating: rating,
                created_at: new Date() 
            }]);
    },

    // User Contributions: Save user-submitted translation
    saveUserTranslation: async (userId, data) => {
        const { sourceText, userTranslation, sourceLanguageId, targetLanguageId } = data;
        return await supabaseAdmin
            .from('user_recommended_translations')
            .insert([{
                user_id: userId,
                source_text: sourceText,
                user_translation: userTranslation,
                source_language_id: sourceLanguageId,
                target_language_id: targetLanguageId,
                status: 'pending', // pending review/approval
                created_at: new Date()
            }])
            .select();
    },

    // Get user-submitted translations for review (admin)
    getUserTranslations: async (filters = {}) => {
        let query = supabaseAdmin.from('user_recommended_translations').select('*');
        
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }
        
        return await query.order('created_at', { ascending: false });
    }
};