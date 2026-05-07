import axios from 'axios';
import Tesseract from 'tesseract.js';
import { TranslationModel } from '../models/translation.model.js';

import * as TranslationService from '../services/translation.service.js';

export const translateImage = async (req, res, next) => {
    try {
        const { image, targetLang, source_language_id, target_language_id } = req.body;
        const text = await TranslationService.performOCR(image.replace(/^data:image\/\w+;base64,/, ''));
        const translatedText = await TranslationService.performTranslation(text, targetLang);

        if (req.user?.id) {
            await TranslationService.saveHistory(req.user.id, {
                sourceText: text, translatedText, sourceLanguageId: source_language_id, targetLanguageId: target_language_id
            });
        }
        res.status(200).json({ success: true, translatedText });
    } catch (err) { next(err); }
};

export const translateAudio = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No audio file" });
        
        const { targetLang, sourceLang, source_language_id, target_language_id } = req.body;

        // 1. Get the object from Service { transcript, translation, status }
        const result = await TranslationService.performSpeechToText(
            req.file.path, 
            targetLang, 
            sourceLang
        );

        console.log("AI Result Object:", result);

        // 2. Save to History
        if (req.user?.id) {
            const historyPayload = {
                // Use result.transcript for the source text
                sourceText: result.transcript, 
                // Use result.translation for the translated text
                translatedText: result.translation, 
                sourceLanguageId: source_language_id || 1, 
                targetLanguageId: target_language_id || 2
            };

            console.log("Database Payload:", historyPayload);

            const { error } = await TranslationService.saveHistory(req.user.id, historyPayload);
            
            if (error) {
                console.error("Supabase Save Error:", error.message);
            }
        }

        // 3. Return to Mobile
        res.status(200).json({ 
            success: true, 
            translation: result.translation, 
            transcript: result.transcript 
        });
    } catch (err) { 
        console.error("Translate Audio Controller Error:", err);
        next(err); 
    }
};

export const translateText = async (req, res, next) => {
    try {
        const { sourceText, sourceLang, targetLang, source_language_id, target_language_id } = req.body;
        
        // Ensure sourceText is a clean string
        if (!sourceText) return res.status(400).json({ message: "No text provided" });

        const translatedText = await TranslationService.performTranslation(sourceText, sourceLang, targetLang);
        
        // Log the result here to verify if it's "clean" before saving to Supabase
        console.log("Raw AI Output:", translatedText); 

        const { data, error } = await TranslationService.saveHistory(req.user.id, {
            sourceText, translatedText, sourceLanguageId: source_language_id, targetLanguageId: target_language_id
        });
        
        if (error) throw error;
        res.status(200).json({ success: true, translatedText, historyRecord: data?.[0] });
    } catch (err) { next(err); }
};

// CRUD: View History
export const getUserHistory = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const { data, error } = await TranslationModel.getHistory(userId);

        if (error) {
            console.error('Supabase History Error:', error);
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(200).json({ success: true, data: data || [] });
    } catch (error) {
        console.error('History Controller Crash:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// CRUD: Delete History
export const deleteUserHistory = async (req, res) => {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'Invalid history id' });
    }

    const { error } = await TranslationModel.deleteHistory(Number(id), req.user.id);
    if (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
    res.status(200).json({ success: true, message: 'History deleted successfully' });
};

// CRUD: Add Feedback
export const submitFeedback = async (req, res) => {
    try {
        const { translationId, rating } = req.body;

        if (translationId === undefined || rating === undefined) {
            return res.status(400).json({ success: false, message: 'Missing feedback data' });
        }

        if (Number.isNaN(Number(translationId)) || Number.isNaN(Number(rating))) {
            return res.status(400).json({ success: false, message: 'translationId and rating must be numbers' });
        }

        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 0 || numericRating > 5) {
            return res.status(400).json({ success: false, message: 'rating must be an integer between 0 and 5' });
        }

        const { error } = await TranslationModel.addFeedback(req.user.id, Number(translationId), numericRating);

        if (error) {
            console.error('Supabase Feedback Error:', error);
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(200).json({ success: true, message: 'Feedback recorded' });
    } catch (error) {
        console.error('Feedback Controller Crash:', error);
        return res.status(500).json({ success: false, message: 'Server error during feedback' });
    }
};

// User Contribution: Submit a user-translated text
export const submitUserTranslation = async (req, res, next) => {
    try {
        const { sourceText, userTranslation, sourceLang, targetLang, source_language_id, target_language_id } = req.body;
        const userId = req.user?.id;

        if (!sourceText || !sourceText.trim()) {
            return res.status(400).json({ success: false, message: 'sourceText is required' });
        }

        if (!userTranslation || !userTranslation.trim()) {
            return res.status(400).json({ success: false, message: 'userTranslation is required' });
        }

        if (!sourceLang) {
            return res.status(400).json({ success: false, message: 'sourceLang is required' });
        }

        if (!targetLang) {
            return res.status(400).json({ success: false, message: 'targetLang is required' });
        }

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const sourceLanguageId = source_language_id ?? (Number.isInteger(sourceLang) ? sourceLang : Number.isInteger(parseInt(sourceLang, 10)) ? parseInt(sourceLang, 10) : null);
        const targetLanguageId = target_language_id ?? (Number.isInteger(targetLang) ? targetLang : Number.isInteger(parseInt(targetLang, 10)) ? parseInt(targetLang, 10) : null);

        const { data, error } = await TranslationModel.saveUserTranslation(userId, {
            sourceText,
            userTranslation,
            sourceLanguageId,
            targetLanguageId,
        });

        if (error) {
            throw error;
        }

        return res.status(201).json({
            success: true,
            message: 'Thank you for your contribution! Your translation is under review.',
            data: data?.[0] || null,
        });
    } catch (error) {
        console.error('User Translation Submission Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to submit translation: ' + error.message });
    }
};