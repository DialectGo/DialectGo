import { supabase } from '../config/db.js';

export const GameModel = {
    async getAllActiveGames() {
        return await supabase
            .from('games')
            .select('id, game_title, category, min_language_proficiency')
            .eq('is_active', true);
    },

    async getChallengesByGameId(gameId) {
        return await supabase
            .from('game_challenges')
            .select('*, dictionary_entry:dictionary_entries(*)')
            .eq('game_id', gameId);
    }
};