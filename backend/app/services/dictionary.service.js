import { DictionaryModel } from '../models/dictionary.model.js';

export const findWord = async (term, userId) => {
    // Remove the { data, error } destructuring
    const wordData = await DictionaryModel.findWordByTerm(term);
    
    // Check if wordData exists
    if (userId && wordData) {
        await DictionaryModel.addSearchHistory(userId, term);
    }
    
    return wordData; 
};

export const saveWord = async (userId, dictionaryId) => {
    return await DictionaryModel.saveWord(userId, dictionaryId);
};

export const getSavedWords = async (userId) => {
    return await DictionaryModel.getSavedWordsByUserId(userId);
};