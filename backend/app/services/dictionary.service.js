import { DictionaryModel } from '../models/dictionary.model.js';

export const findWord = async (term, userId) => {
    const { data, error } = await DictionaryModel.findWordByTerm(term);
    if (error) throw error;
    
    // Business logic: Track history only if user is logged in
    if (userId && data) {
        await DictionaryModel.addSearchHistory(userId, term);
    }
    return data;
};

export const saveWord = async (userId, dictionaryId) => {
    return await DictionaryModel.saveWord(userId, dictionaryId);
};

export const getSavedWords = async (userId) => {
    return await DictionaryModel.getSavedWordsByUserId(userId);
};