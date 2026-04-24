import { DictionaryModel } from '../models/dictionaryModel.js';

export const getWordDefinition = async (req, res, next) => {
    try {
        const { term } = req.params;

        if (!term || !term.trim()) {
            return res.status(400).json({ success: false, message: 'Search term is required' });
        }

        const { data, error } = await DictionaryModel.findWordByTerm(term.trim());

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, message: 'Word not found' });

        if (req.user) {
            await DictionaryModel.addSearchHistory(req.user.id, term.trim());
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const saveWord = async (req, res, next) => {
    try {
        const { dictionary_id } = req.body;

        if (!dictionary_id) {
            return res.status(400).json({
                success: false,
                message: 'dictionary_id is required in the request body'
            });
        }

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