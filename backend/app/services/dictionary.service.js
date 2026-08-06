import { DictionaryModel } from '../models/dictionary.model.js';

export const findWord = async (term, userId, token) => {
    // Remove the { data, error } destructuring
    const wordData = await DictionaryModel.findWordByTerm(term, token);
    
    // Check if wordData exists
    if (userId && wordData) {
        await DictionaryModel.addSearchHistory(userId, term, token);
    }
    
    return wordData; 
};

export const getPaginatedWords = async (page, limit, languageId, letter, token) => {
    const wordData = await DictionaryModel.getPaginatedWords(page, limit, languageId, letter, token);
    if (!wordData) return [];
    return wordData;
};

export const saveWord = async (userId, dictionaryId, token) => {
    return await DictionaryModel.saveWord(userId, dictionaryId, token);
};

export const getSavedWords = async (userId, token) => {
    return await DictionaryModel.getSavedWordsByUserId(userId, token);
};

export const deleteSavedWords = async (userId, ids, token) => {
    if (!ids || ids.length === 0) {
        throw new Error('No items selected for deletion');
    }
    
    const { data, error } = await DictionaryModel.deleteMultipleSavedWords(userId, ids, token);
    
    if (error) throw error;
    return data;
};

export const getSearchHistory = async (userId, token) => {
    return await DictionaryModel.getHistoryByUserId(userId, token);
};

export const deleteHistoryItems = async (userId, ids, token) => {
    if (!ids || ids.length === 0) {
        throw new Error('No history items selected');
    }
    
    const { data, error } = await DictionaryModel.deleteMultipleHistory(userId, ids, token);
    
    if (error) throw error;
    return data;
};

export const getRandomCebuanoWord = async (token) => {
    const wordData = await DictionaryModel.getRandomCebuanoWord(token);
    if (!wordData) throw new Error('No words available');
    return wordData;
};

// Add this inside dictionary.service.js
export const checkIfSaved = async (userId, dictionaryId, token) => {
    return await DictionaryModel.isWordSaved(userId, dictionaryId, token);
};