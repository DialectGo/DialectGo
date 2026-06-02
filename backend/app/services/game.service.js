import { GameModel } from '../models/game.model.js';

export const getAllGames = async () => {
    return await GameModel.getAllActiveGames();
};

export const getChallenges = async (gameId, difficulty, targetLanguage) => {
    const { data, error } = await GameModel.getChallengesByGameId(gameId, difficulty, targetLanguage);
    if (error) return { error };
    return { data };
};