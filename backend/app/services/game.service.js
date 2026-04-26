import { GameModel } from '../models/game.model.js';

export const getAllGames = async () => {
    return await GameModel.getAllActiveGames();
};

export const getChallenges = async (gameId) => {
    const { data, error } = await GameModel.getChallengesByGameId(gameId);
    if (error) return { error };

    // Business Logic: Data transformation is kept in the Service layer
    const formattedData = data ? data.map(item => item.dictionary_entry) : [];
    return { data: formattedData };
};