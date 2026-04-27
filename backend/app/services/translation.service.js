import axios from 'axios';
import Tesseract from 'tesseract.js';
import { TranslationModel } from '../models/translation.model.js';

const COLAB_URL = process.env.COLAB_URL;

export const performTranslation = async (text, targetLang) => {
    // Adding a "strict" constraint to the prompt
    const prompt = `You are a professional translator. Translate the following text into ${targetLang}. 
    Provide ONLY the translation. Do not add quotes, introductory text, or any explanations. 
    Source text: "${text}" 
    Translation:`;

    const response = await axios.post(COLAB_URL, { 
        instruction: prompt, 
        input: text 
    });
    
    // Clean the output just in case
    return response?.data?.translation?.trim();
};

export const performOCR = async (base64Image) => {
    const { data: { text } } = await Tesseract.recognize(Buffer.from(base64Image, 'base64'), 'eng');
    return text;
};

export const saveHistory = async (userId, data) => await TranslationModel.saveHistory(userId, data);
export const getHistory = async (userId) => await TranslationModel.getHistory(userId);
export const deleteHistory = async (id, userId) => await TranslationModel.deleteHistory(id, userId);
export const addFeedback = async (userId, tId, rating) => await TranslationModel.addFeedback(userId, tId, rating);
export const submitRecommendation = async (userId, data) => await TranslationModel.saveUserTranslation(userId, data);