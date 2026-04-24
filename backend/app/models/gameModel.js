import { supabase, supabaseAdmin } from '../config/db.js';

class GameModel {
    static async getAllActiveGames() {
        const { data, error } = await supabaseAdmin
            .from('games')
            .select('id, game_title, category, min_language_proficiency')
            .eq('is_active', true);

        return { data, error };
    }

    static async getChallengesByGameId(gameId) {
        const { data, error } = await supabaseAdmin
            .from('game_challenges')
            .select('*, dictionary_entry:dictionary_entries(*)')
            .eq('game_id', gameId);

        // Flatten the response to return only dictionary entries
        const challenges = data ? data.map(item => item.dictionary_entry) : null;

        return { data: challenges, error };
    }
}

export { GameModel };