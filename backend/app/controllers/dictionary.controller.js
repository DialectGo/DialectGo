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

export const deleteSelectedWords = async (req, res, next) => {
    try {
        const { ids } = req.body;
        const userId = req.user.id;

        await DictionaryService.deleteSavedWords(userId, ids);

        res.status(200).json({ 
            success: true, 
            message: 'Items deleted successfully' 
        });
    } catch (err) {
        // If the error comes from the service check, send 400, else 500 via next(err)
        if (err.message === 'No items selected for deletion') {
            return res.status(400).json({ success: false, message: err.message });
        }
        next(err);
    }
};

export const getSearchHistory = async (req, res, next) => {
    try {
        const data = await DictionaryService.getSearchHistory(req.user.id);
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const deleteSelectedHistory = async (req, res, next) => {
    try {
        const { ids } = req.body;
        const userId = req.user.id;

        await DictionaryService.deleteHistoryItems(userId, ids);

        res.status(200).json({ 
            success: true, 
            message: 'History items deleted successfully' 
        });
    } catch (err) {
        if (err.message === 'No history items selected') {
            return res.status(400).json({ success: false, message: err.message });
        }
        next(err);
    }
};

export const getWordOfTheDay = async (req, res, next) => {
    try {
        const data = await DictionaryService.getRandomCebuanoWord();
        res.status(200).json({ success: true, data });
    } catch (err) {
        // This ensures the error is returned as JSON, preventing the HTML error page
        res.status(500).json({ success: false, message: err.message });
    }
};