import { supabase, supabaseAdmin } from '../config/db.js';

export const DictionaryModel = {
    async findWordByTerm(term) {
        return await supabaseAdmin
            .from('dictionary_entries')
            .select(`
                *,
                translations:dictionary_translations!source_entry_id(
                    target_entry:dictionary_entries!target_entry_id(*)
                )
            `)
            .ilike('word_term', term)
            .maybeSingle();
    },

    async saveWord(userId, dictionaryId) {
        return await supabaseAdmin
            .from('user_saved_words')
            .insert([{ user_id: userId, dictionary_id: dictionaryId }])
            .select();
    },

    async getSavedWordsByUserId(userId) {
        return await supabaseAdmin
            .from('user_saved_words')
            .select('*, entry:dictionary_entries(*)')
            .eq('user_id', userId);
    },

    async addSearchHistory(userId, term) {
        return await supabaseAdmin
            .from('search_history')
            .insert([{ user_id: userId, search_term: term }]);
    }
};