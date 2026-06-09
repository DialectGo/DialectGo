import { supabase } from '../config/db.js';

const MAX_HEARTS = 8;
const REGEN_RATE_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const HEART_PURCHASE_BONUS = 2;

const normalizeHearts = (value) => Math.max(0, Number(value || 0));

export const ProgressModel = {
    async getProgressWithHeartRegen(userId, gameId = 1, difficulty = 'none') {
        const { data: current, error: getError } = await supabase
            .from('user_game_progress')
            .select('id, user_id, game_id, difficulty, total_xp, current_level, high_score, current_hearts, last_heart_consumed_at, completed_levels')
            .eq('user_id', userId)
            .eq('game_id', gameId)
            .eq('difficulty', difficulty)
            .maybeSingle();

        if (getError) return { data: null, error: getError };

        if (!current) {
            return { data: {
                total_xp: 0,
                current_level: 1,
                high_score: 0,
                current_hearts: MAX_HEARTS,
                last_heart_consumed_at: new Date().toISOString(),
                completed_levels: [],
                game_id: gameId,
                difficulty,
            }, error: null };
        }

        let hearts = current.current_hearts ?? MAX_HEARTS;
        if (hearts < MAX_HEARTS && current.last_heart_consumed_at) {
            const lastConsumed = new Date(current.last_heart_consumed_at).getTime();
            const now = new Date().getTime();
            const timePassed = now - lastConsumed;
            const heartsToRestore = Math.floor(timePassed / REGEN_RATE_MS);

            if (heartsToRestore > 0) {
                const updatedHearts = Math.min(MAX_HEARTS, hearts + heartsToRestore);
                const newTimestamp = updatedHearts === MAX_HEARTS
                    ? new Date().toISOString()
                    : new Date(lastConsumed + (heartsToRestore * REGEN_RATE_MS)).toISOString();

                const { data: updatedData, error: updateError } = await supabase
                    .from('user_game_progress')
                    .update({ current_hearts: updatedHearts, last_heart_consumed_at: newTimestamp })
                    .eq('id', current.id)
                    .select('id, user_id, game_id, difficulty, total_xp, current_level, high_score, current_hearts, last_heart_consumed_at, completed_levels')
                    .maybeSingle();

                if (!updateError && updatedData) return { data: updatedData, error: null };
            }
        }

        return { data: current, error: null };
    },

    async getProgress(userId, gameId = 1, difficulty = 'none') {
        if (Number(gameId) === 0) {
            return await this.getCentralizedProgress(userId);
        }
        return await this.getProgressWithHeartRegen(userId, gameId, difficulty);
    },

    async getAllUserProgressRows(userId) {
        return await supabase
            .from('user_game_progress')
            .select('id, user_id, game_id, difficulty, total_xp, current_level, high_score, current_hearts, last_heart_consumed_at, completed_levels')
            .eq('user_id', userId)
            .order('game_id', { ascending: true });
    },

    async getCentralizedProgress(userId) {
        const { data: rows, error } = await this.getAllUserProgressRows(userId);

        if (error) return { data: null, error };

        if (!rows || rows.length === 0) {
            return {
                data: {
                    total_xp: 0,
                    current_level: 1,
                    high_score: 0,
                    current_hearts: MAX_HEARTS,
                    last_heart_consumed_at: new Date().toISOString(),
                    completed_levels: [],
                },
                error: null,
            };
        }

        const totalXp = rows.reduce((sum, row) => sum + Number(row.total_xp || 0), 0);
        const highScore = rows.reduce((best, row) => Math.max(best, Number(row.high_score || 0)), 0);
        const currentHearts = rows.reduce((min, row) => Math.min(min, Number(row.current_hearts ?? MAX_HEARTS)), MAX_HEARTS);

        return {
            data: {
                id: rows[0].id,
                user_id: userId,
                game_id: 0,
                difficulty: 'global',
                total_xp: totalXp,
                current_level: Math.max(1, Math.floor(totalXp / 100) + 1),
                high_score: highScore,
                current_hearts: currentHearts,
                last_heart_consumed_at: rows[0].last_heart_consumed_at || new Date().toISOString(),
                completed_levels: rows.flatMap(row => Array.isArray(row.completed_levels) ? row.completed_levels : []),
            },
            error: null,
        };
    },

    async getSessionById(sessionId) {
        return await supabase
            .from('user_game_sessions')
            .select('user_id, game_id, session_data')
            .eq('id', sessionId)
            .maybeSingle();
    },

    async updateProgress(userId, gameId = 1, difficulty = 'none', xpGained = 0, scoreGained = 0, levelCompleted = null) {
        const { data: current, error: getError } = await this.getProgress(userId, gameId, difficulty);
        if (getError) return { data: null, error: getError };

        const currentXp = Number(current?.total_xp || 0);
        const currentHighScore = Number(current?.high_score || 0);
        const currentLevels = Array.isArray(current?.completed_levels) ? current.completed_levels : [];

        const newXp = Math.max(0, currentXp + Number(xpGained || 0));
        const newHighScore = Number(scoreGained || 0) > currentHighScore ? Number(scoreGained || 0) : currentHighScore;
        const updatedLevels = levelCompleted && Number(levelCompleted) > 0 && !currentLevels.includes(Number(levelCompleted))
            ? [...currentLevels, Number(levelCompleted)]
            : currentLevels;

        if (!current || !current.id) {
            return await supabase
                .from('user_game_progress')
                .insert([{
                    user_id: userId,
                    game_id: Number(gameId),
                    difficulty,
                    total_xp: newXp,
                    current_level: Math.max(1, Math.floor(newXp / 100) + 1),
                    high_score: newHighScore,
                    completed_levels: updatedLevels,
                    current_hearts: MAX_HEARTS,
                    last_heart_consumed_at: new Date().toISOString(),
                    last_played_at: new Date().toISOString()
                }])
                .select('*')
                .single();
        }

        const updatedRow = await supabase
            .from('user_game_progress')
            .update({
                total_xp: newXp,
                current_level: Math.max(1, Math.floor(newXp / 100) + 1),
                high_score: newHighScore,
                completed_levels: updatedLevels,
                last_played_at: new Date().toISOString()
            })
            .eq('id', current.id)
            .select('*')
            .single();

        if (updatedRow.error) return updatedRow;

        return updatedRow;
    },

    // Deducts a life manually and shifts timestamps when falling below MAX_HEARTS
    async consumeHeart(userId, gameId = 1, difficulty = 'none', currentHeartsValue) {
        const newHearts = normalizeHearts(currentHeartsValue);
        const updatePayload = { current_hearts: newHearts };

        if (Number(currentHeartsValue) === MAX_HEARTS - 1) {
            updatePayload.last_heart_consumed_at = new Date().toISOString();
        }

        const { data: rows } = await this.getAllUserProgressRows(userId);

        if (rows && rows.length > 0) {
            await Promise.all(rows.map(row =>
                supabase
                    .from('user_game_progress')
                    .update({
                        current_hearts: newHearts,
                        last_heart_consumed_at: updatePayload.last_heart_consumed_at || row.last_heart_consumed_at,
                    })
                    .eq('id', row.id)
            ));
        }

        return await supabase
            .from('user_game_progress')
            .update(updatePayload)
            .eq('user_id', userId)
            .eq('game_id', Number(gameId))
            .eq('difficulty', difficulty)
            .select('*')
            .single();
    },

    async purchaseHeartsWithXp(userId, gameId = 1, difficulty = 'none', xpCost) {
        const { data: rows, error: getRowsError } = await this.getAllUserProgressRows(userId);
        if (getRowsError) return { data: null, error: getRowsError };

        const totalXp = rows.reduce((sum, row) => sum + Number(row.total_xp || 0), 0);

        if (totalXp < xpCost) {
            return { data: null, error: new Error('Insufficient XP balance.') };
        }

        const newTotalXp = totalXp - xpCost;
        const deductions = [];
        let runningDeduction = 0;

        rows.forEach((row, index) => {
            const share = totalXp === 0 ? 0 : Number(row.total_xp || 0) / totalXp;
            const deduction = Math.floor(xpCost * share);
            runningDeduction += deduction;
            deductions.push({ row, deduction, isLast: index === rows.length - 1 });
        });

        const remainder = xpCost - runningDeduction;
        if (remainder > 0 && deductions.length > 0) {
            deductions[deductions.length - 1].deduction += remainder;
        }

        await Promise.all(deductions.map(({ row, deduction }) =>
            supabase
                .from('user_game_progress')
                .update({
                    total_xp: Math.max(0, Number(row.total_xp || 0) - deduction),
                    current_level: Math.max(1, Math.floor(Math.max(0, Number(row.total_xp || 0) - deduction) / 100) + 1),
                    current_hearts: Math.min(MAX_HEARTS, Number(row.current_hearts || MAX_HEARTS) + HEART_PURCHASE_BONUS),
                    last_played_at: new Date().toISOString(),
                })
                .eq('id', row.id)
        ));

        const { data: updatedRows } = await this.getAllUserProgressRows(userId);
        return {
            data: {
                total_xp: newTotalXp,
                current_hearts: updatedRows?.length ? Math.min(MAX_HEARTS, Math.max(...updatedRows.map(row => Number(row.current_hearts || MAX_HEARTS)))) : MAX_HEARTS,
                current_level: Math.max(1, Math.floor(newTotalXp / 100) + 1),
            },
            error: null,
        };
    },

    async getLeaderboard() {
        return await supabase
            .from('user_game_progress')
            .select('user_id, total_xp, high_score')
            .order('high_score', { ascending: false }) 
            .limit(10);
    }
};