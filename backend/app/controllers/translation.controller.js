import axios from 'axios';
import Tesseract from 'tesseract.js';
import { TranslationModel } from '../models/translation.model.js';
import { ReportModel } from '../models/report.model.js';
import * as TranslationService from '../services/translation.service.js';
import * as MetaLayerService from '../services/metaLayer.service.js';
import { synthesizeSpeech } from '../services/tts.service.js';

export const translateImage = async (req, res, next) => {
    try {
        const { image, sourceLang, targetLang, source_language_id, target_language_id, targetDialect } = req.body;
        const text = await TranslationService.performOCR(image.replace(/^data:image\/\w+;base64,/, ''));

        // Run through the pre-processing pipeline before translation
        const result = await TranslationService.performPreprocessedTranslation(text, sourceLang, targetLang, targetDialect || null);

        let savedRecord = null;
        if (req.user?.id) {
            // Save to history and capture the returned data
            const { data, error } = await TranslationService.saveHistory(req.user.id, {
                sourceText: text,
                translatedText: result.translatedText,
                sourceLanguageId: source_language_id,
                targetLanguageId: target_language_id
            });
            if (!error) savedRecord = data?.[0];
        }

        // Ensure you send 'sourceText' and 'historyRecord' back
        res.status(200).json({
            success: true,
            translatedText: result.translatedText,
            sourceText: text,
            historyRecord: savedRecord,
            preprocessing: result.preprocessing,
            dialectization: result.dialectization
        });
    } catch (err) { next(err); }
};

export const translateAudio = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No audio file" });

        const { targetLang, sourceLang, source_language_id, target_language_id, targetDialect } = req.body;

        const result = await TranslationService.performSpeechToText(
            req.file.path,
            targetLang,
            sourceLang
        );

        // Run the transcript through the pre-processing pipeline for a better translation
        let finalTranslation = result.translation;
        let preprocessingMeta = null;

        if (result.transcript && result.transcript.trim().length > 0) {
            try {
                const preprocessed = await TranslationService.performPreprocessedTranslation(
                    result.transcript, sourceLang, targetLang, targetDialect || null
                );
                finalTranslation = preprocessed.translatedText;
                preprocessingMeta = preprocessed.preprocessing;
            } catch (preprocessErr) {
                console.warn('[translateAudio] Preprocessing failed, using original translation:', preprocessErr.message);
                // Fall through with the original translation from STT
            }
        }

        let savedRecordId = null; // Use a dedicated variable for the ID

        if (req.user?.id) {
            const historyPayload = {
                sourceText: result.transcript,
                translatedText: finalTranslation,
                sourceLanguageId: source_language_id || 1,
                targetLanguageId: target_language_id || 2
            };

            // FIX: Destructure 'data' from the service call
            const { data, error } = await TranslationService.saveHistory(req.user.id, historyPayload);

            if (error) {
                console.error("Supabase Save Error:", error.message);
            } else if (data && data.length > 0) {
                savedRecordId = data[0].id; // Safely capture the ID
            }
        }

        // Step: Synthesize the translated text into speech audio (Speech-to-Speech)
        let audioBase64 = null;
        try {
            audioBase64 = await synthesizeSpeech(finalTranslation, targetLang);
        } catch (ttsErr) {
            console.warn('[translateAudio] TTS synthesis failed (non-fatal):', ttsErr.message);
        }

        // Return the gathered ID to the mobile app
        res.status(200).json({
            success: true,
            translation: finalTranslation,
            transcript: result.transcript,
            historyId: savedRecordId,
            preprocessing: preprocessingMeta,
            audioBase64
        });
    } catch (err) {
        console.error("Translate Audio Controller Error:", err);
        next(err);
    }
};

export const translateText = async (req, res, next) => {
    try {
        const { sourceText, sourceLang, targetLang, source_language_id, target_language_id, targetDialect, withBreakdown } = req.body;

        // Ensure sourceText is a clean string
        if (!sourceText) return res.status(400).json({ message: "No text provided" });

        // Choose pipeline: with or without LLM breakdown
        let result;
        if (withBreakdown) {
            result = await TranslationService.performTranslationWithBreakdown(sourceText, sourceLang, targetLang, targetDialect || null);
        } else {
            result = await TranslationService.performPreprocessedTranslation(sourceText, sourceLang, targetLang, targetDialect || null);
        }

        // Log the result here to verify if it's "clean" before saving to Supabase
        console.log("Raw AI Output:", result.translatedText);
        if (result.preprocessing?.wasModified) {
            console.log("Pre-processed Input:", result.canonicalizedText);
        }

        const { data, error } = await TranslationService.saveHistory(req.user.id, {
            sourceText, translatedText: result.translatedText, sourceLanguageId: source_language_id, targetLanguageId: target_language_id
        });

        if (error) throw error;

        // If breakdown was requested, save the report to Supabase
        if (withBreakdown && result.breakdown) {
            try {
                await ReportModel.saveReport(req.user.id, {
                    translationId: data?.[0]?.id || null,
                    sourceText,
                    translatedText: result.translatedText,
                    sourceLang,
                    targetLang,
                    targetDialect: targetDialect || null,
                    breakdown: result.breakdown,
                    sentimentAnalysis: result.preprocessing?.sentimentAnalysis || {},
                });
            } catch (reportErr) {
                console.warn('[translateText] Failed to save breakdown report:', reportErr.message);
                // Non-fatal — continue with the response
            }
        }

        res.status(200).json({
            success: true,
            translatedText: result.translatedText,
            historyRecord: data?.[0],
            preprocessing: result.preprocessing,
            dialectization: result.dialectization,
            breakdown: result.breakdown || null,
        });
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
        const { translationId, rating, comment } = req.body;

        if (!translationId) {
            return res.status(400).json({ success: false, message: 'Missing translationId' });
        }

        // Map frontend 5/1 to backend 1/0 for the CHECK constraint
        const dbRating = (rating >= 5) ? 1 : 0;

        const { data, error } = await TranslationModel.addFeedback(
            req.user.id,
            Number(translationId),
            dbRating,
            comment
        );

        if (error) throw error;

        return res.status(200).json({ success: true, message: 'Feedback synced successfully' });
    } catch (error) {
        console.error('Feedback Sync Error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
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

// LLM Meta-Layer: Customize an existing translation with tone/audience/context
export const customizeTranslation = async (req, res, next) => {
    try {
        const { sourceText, translatedText, sourceLang, targetLang, tone, audience, context, style } = req.body;
        const userId = req.user?.id;

        if (!sourceText || !translatedText) {
            return res.status(400).json({ success: false, message: 'sourceText and translatedText are required' });
        }

        const customized = await MetaLayerService.customizeTranslation({
            sourceText, translatedText, sourceLang, targetLang,
            tone, audience, context, style,
        });

        // Save the customization report
        if (userId) {
            try {
                await ReportModel.saveReport(userId, {
                    translationId: null,
                    sourceText,
                    translatedText: customized.customizedText,
                    sourceLang,
                    targetLang,
                    breakdown: customized,
                    sentimentAnalysis: {},
                });
            } catch (reportErr) {
                console.warn('[customizeTranslation] Failed to save report:', reportErr.message);
            }
        }

        res.status(200).json({
            success: true,
            customizedText: customized.customizedText,
            explanation: customized.explanation,
            toneApplied: customized.toneApplied,
            audienceApplied: customized.audienceApplied,
            changes: customized.changes || [],
            metadata: customized.metadata,
        });
    } catch (err) { next(err); }
};

export const adminGetAllHistory = async (req, res, next) => {
    try {
        const { supabaseAdmin } = await import('../config/db.js');
        const { data, error } = await supabaseAdmin
            .from('translation_history')
            .select(`
                *,
                profiles:user_id (username, first_name, last_name),
                source_lang:source_language_id (name, code),
                target_lang:target_language_id (name, code)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, data: data || [] });
    } catch (err) { next(err); }
};

// ADMIN: Fetch all user contributed recommendations
export const adminGetAllRecommendations = async (req, res, next) => {
    try {
        const { supabaseAdmin } = await import('../config/db.js');
        const { data, error } = await supabaseAdmin
            .from('user_recommended_translations')
            .select(`
                *,
                profiles:user_id (username, first_name, last_name),
                source_lang:source_language_id (name, code),
                target_lang:target_language_id (name, code)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, data: data || [] });
    } catch (err) { next(err); }
};

// ADMIN: Get metric analytics points for Chart.js daily timeline graphing
export const adminGetTranslationAnalytics = async (req, res, next) => {
    try {
        const { supabaseAdmin } = await import('../config/db.js');

        // Fetch trailing 7 days timeline rows
        const trailingWindow = new Date();
        trailingWindow.setDate(trailingWindow.getDate() - 7);

        const { data, error } = await supabaseAdmin
            .from('translation_history')
            .select('created_at')
            .gte('created_at', trailingWindow.toISOString());

        if (error) throw error;

        // Group rows programmatically by calendar dates
        const dateBucketMap = {};
        for (let i = 6; i >= 0; i--) {
            const dateStr = new Date();
            dateStr.setDate(dateStr.getDate() - i);
            const formatted = dateStr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateBucketMap[formatted] = 0;
        }

        data.forEach(row => {
            const formattedRowDate = new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (dateBucketMap[formattedRowDate] !== undefined) {
                dateBucketMap[formattedRowDate]++;
            }
        });

        res.status(200).json({
            success: true,
            data: Object.entries(dateBucketMap).map(([date, value]) => ({ date, count: value }))
        });
    } catch (err) { next(err); }
};