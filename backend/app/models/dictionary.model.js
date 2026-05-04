import { supabase, supabaseAdmin } from '../config/db.js';

export const DictionaryModel = {
    async findWordByTerm(term) {
        console.log(`🔍 Searching for: "${term}"`);
        
        const { data: word, error: err } = await supabase
            .from('dictionary_entries')
            .select(`
                *,
                translations:dictionary_translations!dictionary_translations_source_entry_id_fkey (
                    id,
                    target_entry:dictionary_entries!dictionary_translations_target_entry_id_fkey (
                        word_term,
                        definition,
                        part_of_speech,
                        example_usage
                    )
                )
            `)
            .ilike('word_term', term)
            .maybeSingle();

        if (err) {
            console.error("Database Error:", err);
            throw err; 
        }

        // DEBUG: This will show you exactly what the object structure looks like
        if (word) {
            console.log("Full Object Structure:", JSON.stringify(word, null, 2));
        }
        
        return word; 
    },

    async saveWord(userId, dictionaryId) {
        return await supabase
            .from('user_saved_words')
            .insert([{ user_id: userId, dictionary_id: dictionaryId }])
            .select();
    },

    async getSavedWordsByUserId(userId) {
        return await supabase
            .from('user_saved_words')
            .select(`
                *,
                entry:dictionary_entries (
                    *,
                    translations:dictionary_translations!dictionary_translations_source_entry_id_fkey (
                        id,
                        target_entry:dictionary_entries!dictionary_translations_target_entry_id_fkey (
                            word_term,
                            definition,
                            part_of_speech,
                            example_usage
                        )
                    )
                )
            `)
            .eq('user_id', userId);
    },

    async deleteMultipleSavedWords(userId, ids) {
        return await supabase
            .from('user_saved_words')
            .delete()
            .eq('user_id', userId)
            .in('id', ids);
    },

    async addSearchHistory(userId, term) {
        // console.log("Attempting to insert:", { userId, term });
        const result = await supabase
            .from('search_history')
            .insert([{ user_id: userId, search_term: term }])
            .select();
        
        if (result.error) console.error("Database Insert Error:", result.error);
        return result;
    },
    async getHistoryByUserId(userId) {
        const { data, error } = await supabase
            .from('search_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }); // Show newest first

        if (error) throw error;
        return data;
    },

    async deleteMultipleHistory(userId, ids) {
        return await supabase
            .from('search_history')
            .delete()
            .eq('user_id', userId)
            .in('id', ids);
    },
};