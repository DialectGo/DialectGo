import { supabase } from '../config/db.js';

const MAX_HEARTS = 8;
const REGEN_RATE_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export const ProgressModel = {
    // ✅ INTEGRATED: Fetches all fields exactly like the old version while processing passive heart regeneration
    async getProgressWithHeartRegen(userId) {
        const { data: current, error: getError } = await supabase
            .from('user_game_progress')
            .select('total_xp, current_level, high_score, current_hearts, last_heart_consumed_at')
            .eq('user_id', userId)
            .maybeSingle();

        if (getError || !current) return { data: current, error: getError };

        // Fallback safely if current_hearts is not yet initialized in the table schema
        let hearts = current.current_hearts !== undefined ? current.current_hearts : MAX_HEARTS;
        
        if (hearts < MAX_HEARTS && current.last_heart_consumed_at) {
            const lastConsumed = new Date(current.last_heart_consumed_at).getTime();
            const now = new Date().getTime();
            const timePassed = now - lastConsumed;
            
            const heartsToRestore = Math.floor(timePassed / REGEN_RATE_MS);
            
            if (heartsToRestore > 0) {
                const updatedHearts = Math.min(MAX_HEARTS, hearts + heartsToRestore);
                
                // If maxed out, clear/reset the timestamp, otherwise increment timestamp cleanly by hours consumed
                const newTimestamp = updatedHearts === MAX_HEARTS 
                    ? new Date().toISOString()
                    : new Date(lastConsumed + (heartsToRestore * REGEN_RATE_MS)).toISOString();

                const { data: updatedData, error: updateError } = await supabase
                    .from('user_game_progress')
                    .update({
                        current_hearts: updatedHearts,
                        last_heart_consumed_at: newTimestamp
                    })
                    .eq('user_id', userId)
                    .select('total_xp, current_level, high_score, current_hearts, last_heart_consumed_at')
                    .maybeSingle(); // Ensure clean single item resolution matching old version specs

                if (!updateError && updatedData) {
                    return { data: updatedData, error: null };
                }
            }
        }

        return { data: current, error: null };
    },

    // ✅ Old version reference wrapper: Handled cleanly via the integrated calc engine
    async getProgress(userId) {
        return await this.getProgressWithHeartRegen(userId);
    },

    async getSessionById(sessionId) {
        return await supabase
            .from('user_game_sessions')
            .select('user_id')
            .eq('id', sessionId)
            .maybeSingle();
    },

    async updateProgress(userId, xpGained, scoreGained = 0) {
        const { data: current, error: getError } = await this.getProgress(userId);
        if (getError) return { data: null, error: getError };

        if (!current) {
            return await supabase
                .from('user_game_progress')
                .insert([{
                    user_id: userId,
                    total_xp: Math.max(0, xpGained),
                    current_level: Math.floor(Math.max(0, xpGained) / 100) + 1,
                    high_score: scoreGained,
                    current_hearts: MAX_HEARTS,
                    last_heart_consumed_at: new Date().toISOString(),
                    last_played_at: new Date().toISOString()
                }])
                .select();
        }

        const newXp = Math.max(0, current.total_xp + xpGained);
        const newHighScore = scoreGained > (current.high_score || 0) ? scoreGained : current.high_score;

        return await supabase
            .from('user_game_progress')
            .update({ 
                total_xp: newXp, 
                current_level: Math.floor(newXp / 100) + 1, 
                high_score: newHighScore,
                last_played_at: new Date().toISOString() 
            })
            .eq('user_id', userId)
            .select();
    },

    // Deducts a life manually and shifts timestamps when falling below MAX_HEARTS
    async consumeHeart(userId, currentHeartsValue) {
        const newHearts = Math.max(0, currentHeartsValue - 1);
        const updatePayload = { current_hearts: newHearts };

        if (currentHeartsValue === MAX_HEARTS) {
            updatePayload.last_heart_consumed_at = new Date().toISOString();
        }

        return await supabase
            .from('user_game_progress')
            .update(updatePayload)
            .eq('user_id', userId)
            .select();
    },

    async purchaseHeartsWithXp(userId, xpCost) {
        const { data: current, error: getError } = await this.getProgress(userId);
        if (getError) return { data: null, error: getError };
        if (!current || current.total_xp < xpCost) {
            return { data: null, error: new Error("Insufficient XP balance.") };
        }

        const remainingXp = current.total_xp - xpCost;
        return await supabase
            .from('user_game_progress')
            .update({
                total_xp: remainingXp,
                current_level: Math.floor(remainingXp / 100) + 1,
                current_hearts: MAX_HEARTS, 
                last_heart_consumed_at: new Date().toISOString(),
                last_played_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select();
    },

    async getLeaderboard() {
        return await supabase
            .from('user_game_progress')
            .select('user_id, total_xp, high_score')
            .order('high_score', { ascending: false }) 
            .limit(10);
    }
};