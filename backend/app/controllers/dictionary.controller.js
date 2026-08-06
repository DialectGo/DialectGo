import * as DictionaryService from '../services/dictionary.service.js';

export const getWordDefinition = async (req, res, next) => {
    try {
        const { term } = req.params;
        const userId = req.user?.id; // Optional chaining

        const data = await DictionaryService.findWord(term.trim(), userId, req.token);
        
        if (!data) return res.status(404).json({ success: false, message: 'Word not found' });
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const getBrowseWords = async (req, res, next) => {
    try {
        // Extract query parameters with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const languageId = req.query.lang ? parseInt(req.query.lang) : null;
        const letter = req.query.letter || null;

        const data = await DictionaryService.getPaginatedWords(
            page, 
            limit, 
            languageId, 
            letter,
            req.token
        );

        res.status(200).json({
            success: true,
            page,
            limit,
            data
        });
    } catch (err) {
        // Detailed error for debugging, but clean for the frontend
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching dictionary entries',
            error: err.message 
        });
    }
};

export const saveWord = async (req, res, next) => {
    try {
        const data = await DictionaryService.saveWord(req.user.id, req.body.dictionary_id, req.token);
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const getSavedWords = async (req, res, next) => {
    try {
        const data = await DictionaryService.getSavedWords(req.user.id, req.token);
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const deleteSelectedWords = async (req, res, next) => {
    try {
        const { ids } = req.body;
        const userId = req.user.id;

        await DictionaryService.deleteSavedWords(userId, ids, req.token);

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
        const data = await DictionaryService.getSearchHistory(req.user.id, req.token);
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const deleteSelectedHistory = async (req, res, next) => {
    try {
        const { ids } = req.body;
        const userId = req.user.id;

        await DictionaryService.deleteHistoryItems(userId, ids, req.token);

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
        const data = await DictionaryService.getRandomCebuanoWord(req.token);
        res.status(200).json({ success: true, data });
    } catch (err) {
        // This ensures the error is returned as JSON, preventing the HTML error page
        res.status(500).json({ success: false, message: err.message });
    }
};

export const checkSavedStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Dictionary Entry ID is missing.' });
        }

        const isBookmarked = await DictionaryService.checkIfSaved(userId, parseInt(id, 10), req.token);
        
        res.status(200).json({ 
            success: true, 
            isBookmarked 
        });
    } catch (err) {
        next(err);
    }
};