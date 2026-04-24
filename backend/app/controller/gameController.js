import { GameModel } from '../models/gameModel.js';

export const getAllGames = async (req, res, next) => {
    try {
        const { data, error } = await GameModel.getAllActiveGames();

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const getGameChallenges = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await GameModel.getChallengesByGameId(id);

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};