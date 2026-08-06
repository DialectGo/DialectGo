import { GameModel } from '../models/game.model.js';

export const getAllGames = async (token) => {
    return await GameModel.getAllActiveGames(token);
};

export const getChallenges = async (gameId, difficulty, targetLanguage, token) => {
    const { data, error } = await GameModel.getChallengesByGameId(gameId, difficulty, targetLanguage, token);
    if (error) return { error };
    return { data };
};