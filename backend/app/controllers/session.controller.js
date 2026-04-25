import * as SessionService from '../services/session.service.js';

export const startSession = async (req, res, next) => {
    try {
        const { game_id } = req.body;
        const { data, error } = await SessionService.start(req.user.id, game_id);
        
        if (error) throw error;
        res.status(201).json({ success: true, data: { session_id: data.session_id } });
    } catch (err) {
        next(err);
    }
};

export const completeSession = async (req, res, next) => {
    try {
        const { session_id } = req.params;
        const { accuracy_score, session_data } = req.body;
        const { data, error } = await SessionService.complete(session_id, accuracy_score, session_data);

        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};