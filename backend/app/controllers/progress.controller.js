import * as ProgressService from '../services/progress.service.js';

export const getOwnProgress = async (req, res, next) => {
    try {
        const { data, error } = await ProgressService.getUserProgress(req.user.id);
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

        const { data, error } = await ProgressService.getUserProgress(session.user_id);
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
};

export const updateProgress = async (req, res, next) => {
    try {
        // ✅ Hand off both xp_gained and optional score_gained safely to the updated model
        const { xp_gained, score_gained } = req.body;
        const { data, error } = await ProgressService.update(req.user.id, xp_gained, score_gained);
        
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
};

export const getUserProgress = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        // The service layer function exists, just call it here
        const { data, error } = await ProgressService.getUserProgress(user_id);

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
        const { xp_cost } = req.body;
        
        if (!xp_cost || typeof xp_cost !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid or missing xp_cost parameter.' });
        }

        const { data, error } = await ProgressService.deductXpForHearts(req.user.id, xp_cost);
        
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
        const { current_hearts } = req.body;
        const { data, error } = await ProgressService.registerHeartLoss(req.user.id, current_hearts);
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
};