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
        const { data, error } = await ProgressService.update(req.user.id, req.body.xp_gained);
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