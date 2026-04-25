import * as DictionaryService from '../services/dictionary.service.js';

export const getWordDefinition = async (req, res, next) => {
    try {
        const { term } = req.params;
        const userId = req.user?.id; // Optional chaining

        const data = await DictionaryService.findWord(term.trim(), userId);
        
        if (!data) return res.status(404).json({ success: false, message: 'Word not found' });
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const saveWord = async (req, res, next) => {
    try {
        const data = await DictionaryService.saveWord(req.user.id, req.body.dictionary_id);
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const getSavedWords = async (req, res, next) => {
    try {
        const data = await DictionaryService.getSavedWords(req.user.id);
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};