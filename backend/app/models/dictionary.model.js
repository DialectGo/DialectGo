import { supabase, supabaseAdmin, getAuthClient } from '../config/db.js';

export const DictionaryModel = {
    async findWordByTerm(term, token) {
        console.log(`🔍 Searching for: "${term}"`);
        const client = getAuthClient(token);
        
        const { data: word, error: err } = await client
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
            .ilike('word_term', `%${term.trim()}%`)
            // .maybeSingle();

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

    async getPaginatedWords(page = 1, limit = 15, languageId = null, startLetter = null, token) {
        const offset = (page - 1) * limit;
        const client = getAuthClient(token);
        
        let query = client
            .from('dictionary_entries')
            .select(`
                *,
                translations:dictionary_translations!dictionary_translations_source_entry_id_fkey (
                    id,
                    target_entry:dictionary_entries!dictionary_translations_target_entry_id_fkey (
                        word_term,
                        definition,
                        example_usage
                    )
                )
            `)
            .order('word_term', { ascending: true })
            .range(offset, offset + limit - 1);

        if (languageId) {
            query = query.eq('language_id', languageId);
        }

        if (startLetter) {
            query = query.ilike('word_term', `${startLetter}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return data;
    },

    async saveWord(userId, dictionaryId, token) {
        const client = getAuthClient(token);
        return await client
            .from('user_saved_words')
            .insert([{ user_id: userId, dictionary_id: dictionaryId }])
            .select();
    },

    async getSavedWordsByUserId(userId, token) {
        const client = getAuthClient(token);
        return await client
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

    async deleteMultipleSavedWords(userId, ids, token) {
        const client = getAuthClient(token);
        return await client
            .from('user_saved_words')
            .delete()
            .eq('user_id', userId)
            .in('id', ids);
    },

    async addSearchHistory(userId, term, token) {
        const client = getAuthClient(token);
        // console.log("Attempting to insert:", { userId, term });
        const result = await client
            .from('search_history')
            .upsert([{ user_id: userId, search_term: term }], { onConflict: 'user_id, search_term' })
            .select();
        
        if (result.error) console.error("Database Insert Error:", result.error);
        return result;
    },
    async getHistoryByUserId(userId, token) {
        const client = getAuthClient(token);
        const { data, error } = await client
            .from('search_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }); // Show newest first

        if (error) throw error;
        return data;
    },

    async deleteMultipleHistory(userId, ids, token) {
        const client = getAuthClient(token);
        return await client
            .from('search_history')
            .delete()
            .eq('user_id', userId)
            .in('id', ids);
    },
    
    async getRandomCebuanoWord(token) {
        const client = getAuthClient(token);
        // 1. Get total count of Cebuano entries (Language ID 3 based on your code)
        const { count, error: countErr } = await client
            .from('dictionary_entries')
            .select('*', { count: 'exact', head: true })
            .eq('language_id', 3);

        if (countErr) throw countErr;
        if (count === 0) throw new Error("No Cebuano words found");

        const randomOffset = Math.floor(Math.random() * count);

        // 2. Fetch word with full translation details
        const { data, error } = await client
        .from('dictionary_entries')
        .select(`
            *,
            translations:dictionary_translations!source_entry_id (
                id,
                target_entry:dictionary_entries!target_entry_id (
                    word_term,
                    definition,
                    language_id,
                    example_usage
                )
            )
        `)
        .eq('language_id', 3)
        .range(randomOffset, randomOffset)
        .single();

        if (error) throw error;
        return data;
    },
    // Add this inside the DictionaryModel object wrapper inside dictionary.model.js
    async isWordSaved(userId, dictionaryId, token) {
        const client = getAuthClient(token);
        const { data, error } = await client
            .from('user_saved_words')
            .select('id')
            .eq('user_id', userId)
            .eq('dictionary_id', dictionaryId)
            .maybeSingle();

        if (error) {
            console.error("Database query error checking bookmark status:", error);
            throw error;
        }
        return !!data; // Returns true if a row match is found, false otherwise
    },
};