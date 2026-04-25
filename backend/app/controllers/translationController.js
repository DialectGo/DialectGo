import axios from 'axios';
import Tesseract from 'tesseract.js';
import { TranslationModel } from '../models/translationModel.js';

export const translateImage = async (req, res) => {
    try {
        const { image, targetLang, source_language_id, target_language_id } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, message: 'Image data is required' });
        }

        if (!targetLang) {
            return res.status(400).json({ success: false, message: 'targetLang is required' });
        }

        console.log('1. Starting OCR...');
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const { data: { text } } = await Tesseract.recognize(
            Buffer.from(base64Data, 'base64'),
            'eng'
        );

        console.log('2. OCR Text extracted:', text);
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'OCR could not read text from the image' });
        }

        console.log('3. Calling AI Translation...');
        const AI_ENDPOINT = process.env.COLAB_URL || 'https://vaned-procompensation-enda.ngrok-free.dev/translate';

        const aiResponse = await axios.post(AI_ENDPOINT, {
            instruction: `Translate to ${targetLang}.`,
            input: text,
        });

        const translatedText = aiResponse?.data?.translation;
        if (!translatedText) {
            throw new Error('Translation service returned no translated text');
        }

        if (req.user?.id) {
            await TranslationModel.saveHistory(req.user.id, {
                sourceText: text,
                translatedText,
                sourceLanguageId: source_language_id ?? null,
                targetLanguageId: target_language_id ?? null,
            });
        }

        res.status(200).json({ success: true, translatedText });
    } catch (error) {
        console.error('CRITICAL BACKEND ERROR:', error);
        res.status(500).json({ success: false, message: 'Processing failed: ' + error.message });
    }
};

export const translateText = async (req, res) => {
    const { sourceText, sourceLang, targetLang, source_language_id, target_language_id } = req.body;
    const userId = req.user?.id;

    const COLAB_URL = process.env.COLAB_URL || 'https://vaned-procompensation-enda.ngrok-free.dev/translate';

    if (!sourceText || !sourceText.trim()) {
        return res.status(400).json({ success: false, message: 'sourceText is required' });
    }

    if (!sourceLang) {
        return res.status(400).json({ success: false, message: 'sourceLang is required' });
    }

    if (!targetLang) {
        return res.status(400).json({ success: false, message: 'targetLang is required' });
    }

    try {
        const aiResponse = await axios.post(COLAB_URL, {
            instruction: `Translate from ${sourceLang} to ${targetLang}.`,
            input: sourceText,
        });

        const translatedText = aiResponse?.data?.translation;
        if (!translatedText) {
            throw new Error('Translation service returned no translation');
        }

        const sourceLanguageId = source_language_id ?? (Number.isInteger(sourceLang) ? sourceLang : Number.isInteger(parseInt(sourceLang, 10)) ? parseInt(sourceLang, 10) : null);
        const targetLanguageId = target_language_id ?? (Number.isInteger(targetLang) ? targetLang : Number.isInteger(parseInt(targetLang, 10)) ? parseInt(targetLang, 10) : null);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authenticated user is required' });
        }

        const { data, error } = await TranslationModel.saveHistory(userId, {
            sourceText,
            translatedText,
            sourceLanguageId,
            targetLanguageId,
        });

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            translatedText,
            historyRecord: data?.[0] || null,
        });
    } catch (error) {
        console.error('Translation Flow Error:', error);
        res.status(500).json({ success: false, message: 'Translation failed: ' + error.message });
    }
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