import { supabase } from '../config/db.js';

export const GameModel = {
    async getAllActiveGames() {
        return await supabase
            .from('games')
            .select('id, game_title, category, min_language_proficiency')
            .eq('is_active', true);
    },

    async getChallengesByGameId(gameId, difficulty = 'easy', targetLanguage = 'english') {
        console.log(`\n============== BACKEND DEBUG ROW CHECK ==============`);
        console.log(`🎯 Targeting Game ID: ${gameId} | Difficulty Mode: ${difficulty} | Chosen Language: ${targetLanguage}`);

        // Language IDs: 1 = Tagalog, 2 = English, 3 = Cebuano
        const primaryTargetId = targetLanguage.toLowerCase() === 'tagalog' ? 1 : 2;
        const secondaryTargetId = primaryTargetId === 1 ? 2 : 1;

        try {
            // 1. Fetch Cebuano entries (language_id: 3) along with their related target translations
            // using your foreign key: dictionary_translations_source_entry_id_fkey
            let baseQuery = supabase
                .from('dictionary_entries')
                .select(`
                    id, 
                    word_term, 
                    example_usage, 
                    language_id,
                    translations:dictionary_translations!dictionary_translations_source_entry_id_fkey (
                        target_entry:dictionary_entries!dictionary_translations_target_entry_id_fkey (
                            id,
                            word_term,
                            example_usage,
                            language_id
                        )
                    )
                `)
                .eq('language_id', 3);

            // Clean up difficulty matching parameters safely
            if (difficulty === 'hard') {
                // Hard mode requires example usages to exist
                baseQuery = baseQuery
                    .not('example_usage', 'is', null)
                    .neq('example_usage', '')
                    .neq('example_usage', ' ');
            }

            const { data: cebuanoEntries, error: sourceError } = await baseQuery.limit(100);

            if (sourceError) {
                console.error("❌ SUPABASE SOURCE RELATIONSHIP QUERY ERROR:", sourceError);
                return { data: null, error: sourceError };
            }

            if (!cebuanoEntries || cebuanoEntries.length === 0) {
                console.log("⚠️ No Cebuano data entries matched your difficulty filter settings.");
                return { data: [], error: null };
            }

            // 2. Data Processing Pipeline Function
            const buildDataset = (preferredLangId) => {
                const results = [];

                for (const entry of cebuanoEntries) {
                    // Extract translations array safely
                    const translationRows = entry.translations || [];
                    if (translationRows.length === 0) continue;

                    // Find the matched translation entry that corresponds to our targeted language filter
                    const match = translationRows.find(t => t.target_entry?.language_id === preferredLangId);
                    if (!match || !match.target_entry) continue;

                    const target = match.target_entry;

                    let displayText = entry.word_term;
                    let translationTerm = target.word_term;

                    // Handle Hard Mode Requirements: Render full sentences for both prompt and choices
                    if (difficulty === 'hard') {
                        // Ensure both the source text and translation text have valid sentences available
                        const sourceSentence = entry.example_usage?.trim();
                        const targetSentence = target.example_usage?.trim();

                        if (!sourceSentence) continue; // Skip entry if empty

                        displayText = sourceSentence;
                        // Fall back gracefully to word_term if the translated entry lacks a sentence structure
                        translationTerm = targetSentence && targetSentence.length > 0 ? targetSentence : target.word_term;
                    }

                    results.push({
                        id: entry.id,
                        display_text: displayText,
                        translation_term: translationTerm
                    });
                }
                return results;
            };

            // 3. Evaluate matching metrics using the primary target language
            let dataPayload = buildDataset(primaryTargetId);

            // 4. Fallback Action: If preference yield is empty, route back up into alternate translation lists
            if (dataPayload.length === 0) {
                const alternateLabel = secondaryTargetId === 1 ? 'TAGALOG' : 'ENGLISH';
                console.log(`⚠️ Selected choice filter returned 0 active links. Routing backup to ${alternateLabel}...`);
                dataPayload = buildDataset(secondaryTargetId);
            }

            console.log(`🚀 SHIPPED ${dataPayload.length} SECURE CHALLENGES TO REACT NATIVE CLIENT`);
            console.log(`=====================================================\n`);

            return { data: dataPayload, error: null };

        } catch (err) {
            console.error("❌ Fatal processing error inside GameModel:", err);
            return { data: null, error: err };
        }
    }
};