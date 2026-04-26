import { supabase } from '../config/db.js';

export const ProgressModel = {
    async getProgress(userId) {
        return await supabase
            .from('user_game_progress')
            .select('total_xp, current_level, high_score')
            .eq('user_id', userId)
            .maybeSingle();
    },

    async getSessionById(sessionId) {
        return await supabase
            .from('user_game_sessions')
            .select('user_id')
            .eq('id', sessionId)
            .maybeSingle();
    },

    async updateProgress(userId, xpGained) {
        // Fetch current progress using standard client
        const { data: current, error: getError } = await this.getProgress(userId);
        if (getError) return { data: null, error: getError };

        if (!current) {
            return await supabase
                .from('user_game_progress')
                .insert([{
                    user_id: userId,
                    total_xp: xpGained,
                    current_level: Math.floor(xpGained / 100) + 1,
                    last_played_at: new Date().toISOString()
                }])
                .select();
        }

        const newXp = current.total_xp + xpGained;
        return await supabase
            .from('user_game_progress')
            .update({ 
                total_xp: newXp, 
                current_level: Math.floor(newXp / 100) + 1, 
                last_played_at: new Date().toISOString() 
            })
            .eq('user_id', userId)
            .select();
    },

    async getLeaderboard() {
        return await supabase
            .from('user_game_progress')
            .select('user_id, total_xp, high_score')
            .order('total_xp', { ascending: false })
            .limit(10);
    }
};