import * as ProgressService from '../services/progress.service.js';

export const getOwnProgress = async (req, res, next) => {
    try {
        const gameId = req.query.game_id ? Number(req.query.game_id) : 1;
        const difficulty = req.query.difficulty || 'none';

        const { data, error } = await ProgressService.getUserProgress(req.user.id, gameId, difficulty);
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
};

export const getProgressBySession = async (req, res, next) => {
    try {
        const { session_id } = req.params;
        const { data: session, error: sessionError } = await ProgressService.getSessionOwner(session_id);

        if (sessionError) throw sessionError;
        if (!session || session.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden or session not found' });
        }

        const gameId = session.game_id || 1;
        const difficulty = session.session_data?.difficulty || 'none';

        const { data, error } = await ProgressService.getUserProgress(session.user_id, gameId, difficulty);
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
};

export const updateProgress = async (req, res, next) => {
    try {
        const {
            game_id = 1,
            difficulty = 'none',
            xp_gained = 0,
            score_gained = 0,
            level_completed = null,
        } = req.body;

        const { data, error } = await ProgressService.update(
            req.user.id,
            Number(game_id),
            difficulty,
            Number(xp_gained),
            Number(score_gained),
            level_completed,
        );

        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
};

export const getUserProgress = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const gameId = req.query.game_id ? Number(req.query.game_id) : 1;
        const difficulty = req.query.difficulty || 'none';

        const { data, error } = await ProgressService.getUserProgress(user_id, gameId, difficulty);

        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
};

export const getLeaderboard = async (req, res, next) => {
    try {
        const { data, error } = await ProgressService.fetchLeaderboard();
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
};

export const buyHearts = async (req, res, next) => {
    try {
        const { xp_cost, game_id = 1, difficulty = 'none' } = req.body;

        if (!xp_cost || typeof xp_cost !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid or missing xp_cost parameter.' });
        }

        const { data, error } = await ProgressService.deductXpForHearts(req.user.id, Number(game_id), difficulty, xp_cost);
        
        if (error) {
            // Handle explicit balance validation failures safely
            if (error.message === "Insufficient XP balance.") {
                return res.status(400).json({ success: false, message: error.message });
            }
            throw error;
        }

        res.status(200).json({ success: true, data });
    } catch (err) { 
        next(err); 
    }
};

export const loseHeart = async (req, res, next) => {
    try {
        const {
            game_id = 1,
            difficulty = 'none',
            current_hearts,
        } = req.body;

        const { data, error } = await ProgressService.registerHeartLoss(
            req.user.id,
            Number(game_id),
            difficulty,
            current_hearts,
        );

        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
};