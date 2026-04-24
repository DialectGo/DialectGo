import { supabase, supabaseAdmin } from '../config/db.js';

class SessionModel {
    static async startSession(userId, gameId) {
        const { data, error } = await supabaseAdmin
            .from('user_game_sessions')
            .insert([{ user_id: userId, game_id: gameId, start_time: new Date().toISOString() }])
            .select('id')
            .single();

        return { data: data ? { session_id: data.id } : null, error };
    }

    static async completeSession(sessionId, accuracyScore, sessionData) {
        const { data, error } = await supabaseAdmin
            .from('user_game_sessions')
            .update({ 
                end_time: new Date().toISOString(), 
                accuracy_score: accuracyScore, 
                session_data: sessionData 
            })
            .eq('id', sessionId)
            .select();

        return { data, error };
    }
}

export { SessionModel };