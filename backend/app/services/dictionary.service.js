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

export const getPaginatedWords = async (page, limit, languageId, letter) => {
    const wordData = await DictionaryModel.getPaginatedWords(page, limit, languageId, letter);
    if (!wordData) return [];
    return wordData;
};

export const saveWord = async (userId, dictionaryId) => {
    return await DictionaryModel.saveWord(userId, dictionaryId);
};

export const getSavedWords = async (userId) => {
    return await DictionaryModel.getSavedWordsByUserId(userId);
};

export const deleteSavedWords = async (userId, ids) => {
    if (!ids || ids.length === 0) {
        throw new Error('No items selected for deletion');
    }
    
    const { data, error } = await DictionaryModel.deleteMultipleSavedWords(userId, ids);
    
    if (error) throw error;
    return data;
};

export const getSearchHistory = async (userId) => {
    return await DictionaryModel.getHistoryByUserId(userId);
};

export const deleteHistoryItems = async (userId, ids) => {
    if (!ids || ids.length === 0) {
        throw new Error('No history items selected');
    }
    
    const { data, error } = await DictionaryModel.deleteMultipleHistory(userId, ids);
    
    if (error) throw error;
    return data;
};

export const getRandomCebuanoWord = async () => {
    const wordData = await DictionaryModel.getRandomCebuanoWord();
    if (!wordData) throw new Error('No words available');
    return wordData;
};