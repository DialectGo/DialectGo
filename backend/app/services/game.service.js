import { GameModel } from '../models/game.model.js';

export const getAllGames = async () => {
    return await GameModel.getAllActiveGames();
};

export const getChallenges = async (gameId) => {
    return await GameModel.getChallengesByGameId(gameId);
};