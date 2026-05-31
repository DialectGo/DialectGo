import * as GameService from '../services/game.service.js';

const sendResponse = (res, next, result) => {
    if (result.error) return next(result.error);
    res.status(200).json({ success: true, data: result.data });
};

export const getAllGames = async (req, res, next) => {
    const result = await GameService.getAllGames();
    sendResponse(res, next, result);
};

export const getGameChallenges = async (req, res, next) => {
    // Captures both ?difficulty and ?targetLanguage parameters from client url strings
    const { difficulty, targetLanguage } = req.query; 
    const result = await GameService.getChallenges(req.params.id, difficulty, targetLanguage);
    sendResponse(res, next, result);
};