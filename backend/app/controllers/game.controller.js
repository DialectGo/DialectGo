import * as GameService from '../services/game.service.js';

export const getAllGames = async (req, res, next) => {
    try {
        const { data, error } = await GameService.getAllGames();
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const getGameChallenges = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await GameService.getChallenges(id);
        
        if (error) throw error;
        
        // Flatten logic moved here or kept in service if preferred
        const challenges = data ? data.map(item => item.dictionary_entry) : [];
        res.status(200).json({ success: true, data: challenges });
    } catch (err) {
        next(err);
    }
};