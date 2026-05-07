import fs from 'fs';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import { TranslationModel } from '../models/translation.model.js';
import FormDataLib from 'form-data';

const COLAB_URL = process.env.COLAB_URL;

export const performTranslation = async (text, sourceLang, targetLang) => {
    const payload = { 
        input: text,
        target_lang: targetLang 
    };
    
    console.log("Sending to Flask:", payload); // Log this

    try {
        const response = await axios.post(`${COLAB_URL}/translate`, payload);
        return response.data.translation;
    } catch (error) {
        if (error.response) {
            // This will show you exactly what Flask thinks is wrong
            console.error("Flask Error Details:", error.response.data);
        }
        throw error;
    }
};

export const performOCR = async (base64Image) => {
    const { data: { text } } = await Tesseract.recognize(Buffer.from(base64Image, 'base64'), 'eng');
    return text;
};

export const performSpeechToText = async (audioPath, targetLang, sourceLang) => {
    const form = new FormDataLib();
    
    // 1. Append the audio file
    form.append('audio', fs.createReadStream(audioPath));

    // 2. Append the languages (CRITICAL: ensure these match Flask's expected keys)
    form.append('target_lang', targetLang);
    form.append('source_lang', sourceLang);

    const response = await axios.post(`${COLAB_URL}/translate`, form, {
        headers: {
            ...form.getHeaders(), 
        },
    });

    console.log("DEBUG: Flask response structure:", response.data);

    // Return the translation field from the Flask response
    return response.data;
};

export const saveHistory = async (userId, data) => await TranslationModel.saveHistory(userId, data);
export const getHistory = async (userId) => await TranslationModel.getHistory(userId);
export const deleteHistory = async (id, userId) => await TranslationModel.deleteHistory(id, userId);
export const addFeedback = async (userId, tId, rating) => await TranslationModel.addFeedback(userId, tId, rating);
export const submitRecommendation = async (userId, data) => await TranslationModel.saveUserTranslation(userId, data);