import { supabase, getAuthClient } from '../config/db.js';

export const SessionModel = {
    async startSession(userId, gameId, token) {
        const client = getAuthClient(token);
        return await client
            .from('user_game_sessions')
            .insert([{ 
                user_id: userId, 
                game_id: gameId, 
                start_time: new Date().toISOString() 
            }])
            .select('id')
            .single();
    },

    async completeSession(sessionId, accuracyScore, sessionData, token) {
        const client = getAuthClient(token);
        return await client
            .from('user_game_sessions')
            .update({ 
                end_time: new Date().toISOString(), 
                accuracy_score: accuracyScore, 
                session_data: sessionData 
            })
            .eq('id', sessionId)
            .select();
    }
};