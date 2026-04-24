import { supabase, supabaseAdmin } from '../config/db.js';

class ProgressModel {
    static async getProgress(userId) {
        const { data, error } = await supabaseAdmin
            .from('user_game_progress')
            .select('total_xp, current_level, high_score')
            .eq('user_id', userId)
            .maybeSingle();

        return { data, error };
    }

    static async getSessionById(sessionId) {
        const { data, error } = await supabaseAdmin
            .from('user_game_sessions')
            .select('user_id')
            .eq('id', sessionId)
            .maybeSingle();

        return { data, error };
    }

    static async updateProgress(userId, xpGained) {
        const { data: current, error: getError } = await this.getProgress(userId);

        if (getError) return { data: null, error: getError };

        if (!current) {
            const newLevel = Math.floor(xpGained / 100) + 1;
            const { data, error } = await supabaseAdmin
                .from('user_game_progress')
                .insert([{
                    user_id: userId,
                    total_xp: xpGained,
                    current_level: newLevel,
                    last_played_at: new Date().toISOString()
                }])
                .select();

            return { data, error };
        }

        const newXp = current.total_xp + xpGained;
        const newLevel = Math.floor(newXp / 100) + 1; // Simple leveling logic: level up every 100 XP

        const { data, error } = await supabaseAdmin
            .from('user_game_progress')
            .update({ total_xp: newXp, current_level: newLevel, last_played_at: new Date().toISOString() })
            .eq('user_id', userId)
            .select();

        return { data, error };
    }

    static async getLeaderboard() {
        const { data, error } = await supabaseAdmin
            .from('user_game_progress')
            .select('user_id, total_xp, high_score')
            .order('total_xp', { ascending: false })
            .limit(10);

        return { data, error };
    }
}

export { ProgressModel };