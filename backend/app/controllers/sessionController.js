import { SessionModel } from '../models/sessionModel.js';

export const startSession = async (req, res, next) => {
    try {
        const { game_id } = req.body;
        const { data, error } = await SessionModel.startSession(req.user.id, game_id);

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const completeSession = async (req, res, next) => {
    try {
        const { session_id } = req.params;
        const { accuracy_score, session_data } = req.body;
        const { data, error } = await SessionModel.completeSession(session_id, accuracy_score, session_data);

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};