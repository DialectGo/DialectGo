import { DictionaryModel } from '../models/dictionaryModel.js';

export const getWordDefinition = async (req, res, next) => {
    try {
        const { term } = req.params;
        const { data, error } = await DictionaryModel.findWordByTerm(term);

        if (error) throw error;
        if (!data) return res.status(404).json({ message: "Word not found" });

        // Optionally record history if user is logged in
        if (req.user) {
            await DictionaryModel.addSearchHistory(req.user.id, term);
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const saveWord = async (req, res, next) => {
    try {
        const { dictionary_id } = req.body;
        const { data, error } = await DictionaryModel.saveWord(req.user.id, dictionary_id);
        
        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const getSavedWords = async (req, res, next) => {
    try {
        const { data, error } = await DictionaryModel.getSavedWordsByUserId(req.user.id);
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};