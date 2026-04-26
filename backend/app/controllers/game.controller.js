import * as GameService from '../services/game.service.js';

// Centralized response helper
const sendResponse = (res, next, result) => {
    if (result.error) return next(result.error);
    res.status(200).json({ success: true, data: result.data });
};

export const getAllGames = async (req, res, next) => {
    const result = await GameService.getAllGames();
    sendResponse(res, next, result);
};

export const getGameChallenges = async (req, res, next) => {
    const result = await GameService.getChallenges(req.params.id);
    sendResponse(res, next, result);
};