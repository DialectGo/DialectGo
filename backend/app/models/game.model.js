import { supabase } from '../config/db.js';

export const GameModel = {
    async getAllActiveGames() {
        return await supabase
            .from('games')
            .select('id, game_title, category, min_language_proficiency')
            .eq('is_active', true);
    },

    async getChallengesByGameId(gameId, difficulty = 'easy') {
        console.log(`\n============== BACKEND DEBUG ROW CHECK ==============`);
        console.log(`🎯 Targeting Game ID: ${gameId} | Difficulty Mode: ${difficulty}`);

        // 1. SAFE WIDE QUERY: Use the exact relational mapping format from your working dictionary.model.js
        let query = supabase
            .from('dictionary_entries')
            .select(`
                id,
                word_term,
                example_usage,
                language_id,
                translations:dictionary_translations!dictionary_translations_source_entry_id_fkey (
                    id,
                    target_entry:dictionary_entries!dictionary_translations_target_entry_id_fkey (
                        word_term,
                        language_id
                    )
                )
            `)
            // Safely verify if language_id is 3 or look generally if this fails
            .eq('language_id', 3);

        // 2. RESILIENT DIFFICULTY FILTERING:
        // We fallback to a wide collection match if the strict null configurations return empty arrays.
        if (difficulty === 'easy') {
            query = query.or('example_usage.is.null,example_usage.eq."",example_usage.eq." "');
        } else if (difficulty === 'medium') {
            query = query.or('example_usage.ilike.% %,example_usage.is.null,example_usage.eq.""');
        } else if (difficulty === 'hard') {
            // Ensure we don't accidentally wipe out potential values
            query = query.not('example_usage', 'is', null);
        }

        const { data, error } = await query.limit(40);
        
        if (error) {
            console.error("❌ SUPABASE EXECUTION ERROR:", error);
            return { data: null, error };
        }

        // --- FALLBACK CHECK ---
        // If the query still yields 0 rows due to strict filters, we run a broad query to get game assets running!
        let finalData = data;
        if (!finalData || finalData.length === 0) {
            console.log("⚠️ Strict filter returned 0 rows. Running broad emergency query to fetch any available Cebuano words...");
            const fallbackQuery = await supabase
                .from('dictionary_entries')
                .select(`
                    id,
                    word_term,
                    example_usage,
                    language_id,
                    translations:dictionary_translations!dictionary_translations_source_entry_id_fkey (
                        id,
                        target_entry:dictionary_entries!dictionary_translations_target_entry_id_fkey (
                            word_term
                        )
                    )
                `)
                .eq('language_id', 3)
                .limit(20);
                
            if (!fallbackQuery.error && fallbackQuery.data) {
                finalData = fallbackQuery.data;
            }
        }

        console.log(`📊 RAW ROWS RETRIEVED FROM SUPABASE: ${finalData?.length || 0} rows.`);

        if (!finalData || finalData.length === 0) {
            console.log("❌ CRITICAL DATABASE EMPTY: No records found in 'dictionary_entries' with language_id = 3.");
            return { data: [], error: null };
        }

        // 3. SECURE FORMAT MAPPING
        const formattedChallenges = finalData
            .map((entry, idx) => {
                const translationRelation = entry.translations?.[0];
                // Handle nested alignment mapping to extract equivalent translation string
                const targetWord = translationRelation?.target_entry?.word_term;
                
                if (!targetWord) {
                    // Log out specific missing translation linkages for easy tracking
                    console.log(`   -> Row index ${idx} [Word: "${entry.word_term}"] omitted: No linked translation row found.`);
                    return null;
                }

                const displayText = (difficulty === 'hard' && entry.example_usage) ? entry.example_usage : entry.word_term;

                return {
                    id: entry.id,
                    display_text: displayText,
                    translation_term: targetWord
                };
            })
            .filter(Boolean);

        console.log(`🚀 FINAL FORMATTED CHALLENGES SHIPPED TO APP: ${formattedChallenges.length} items.`);
        console.log(`=====================================================\n`);

        return { data: formattedChallenges, error: null };
    }
};