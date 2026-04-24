import { ProgressModel } from '../models/progressModel.js';

export const getOwnProgress = async (req, res, next) => {
    try {
        const { data, error } = await ProgressModel.getProgress(req.user.id);

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const getProgressBySession = async (req, res, next) => {
    try {
        const { session_id } = req.params;
        const { data: session, error: sessionError } = await ProgressModel.getSessionById(session_id);

        if (sessionError) throw sessionError;
        if (!session) {
            return res.status(404).json({ status: 404, message: 'Session not found' });
        }

        if (session.user_id !== req.user.id) {
            return res.status(403).json({ status: 403, message: 'Forbidden: session does not belong to authenticated user' });
        }

        const { data, error } = await ProgressModel.getProgress(session.user_id);
        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const getUserProgress = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        if (!user_id || !user_id.match(/^[0-9a-fA-F-]{36}$/)) {
            return res.status(400).json({ status: 400, message: 'Invalid user_id: must be a UUID' });
        }

        const { data, error } = await ProgressModel.getProgress(user_id);

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const updateProgress = async (req, res, next) => {
    try {
        const { xp_gained } = req.body;
        if (typeof xp_gained !== 'number') {
            return res.status(400).json({ status: 400, message: 'xp_gained must be a number' });
        }

        const { data, error } = await ProgressModel.updateProgress(req.user.id, xp_gained);

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const getLeaderboard = async (req, res, next) => {
    try {
        const { data, error } = await ProgressModel.getLeaderboard();

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};