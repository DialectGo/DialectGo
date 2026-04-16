import axios from 'axios';
import { TranslationModel } from '../models/translationModel.js';

export const translateText = async (req, res) => {
    const { sourceText, sourceLang, targetLang } = req.body;
    const userId = req.user.id; // Assuming your authMiddleware populates req.user
    
    const COLAB_URL = "https://vaned-procompensation-enda.ngrok-free.dev/translate";

    try {
        // 1. Call AI Engine
        const aiResponse = await axios.post(COLAB_URL, {
            instruction: `Translate from ${sourceLang} to ${targetLang}.`,
            input: sourceText
        });

        const translatedText = aiResponse.data.translation;

        // 2. Save to History (Tier 2 -> Tier 3)
        const { data, error } = await TranslationModel.saveHistory(userId, {
            sourceText,
            translatedText,
            sourceLang,
            targetLang
        });

        if (error) throw error;

        res.json({
            status: 200,
            translatedText: translatedText,
            historyRecord: data[0] // Return the database record to the app
        });

    } catch (error) {
        console.error("Translation Flow Error:", error.message);
        res.status(500).json({ message: "Translation failed" });
    }
};

// CRUD: View History
export const getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id; // Check if this is defined!
        
        const { data, error } = await TranslationModel.getHistory(userId);

        if (error) {
            console.error("Supabase History Error:", error);
            return res.status(400).json({ status: 400, message: error.message });
        }

        // ALWAYS return an array, even if empty, to prevent frontend crashes
        return res.status(200).json(data || []);

    } catch (error) {
        console.error("History Controller Crash:", error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};

// CRUD: Delete History
export const deleteUserHistory = async (req, res) => {
    const { id } = req.params;
    const { error } = await TranslationModel.deleteHistory(id, req.user.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "History deleted successfully" });
};

// CRUD: Add Feedback
export const submitFeedback = async (req, res) => {
    try {
        const { translationId, rating } = req.body;

        if (translationId === undefined || rating === undefined) {
            return res.status(400).json({ message: "Missing feedback data" });
        }

        const { data, error } = await TranslationModel.addFeedback(translationId, rating);

        if (error) {
            console.error("Supabase Feedback Error:", error);
            return res.status(400).json({ message: error.message });
        }

        return res.status(200).json({ 
            status: "success", 
            message: "Feedback recorded" 
        });

    } catch (error) {
        console.error("Feedback Controller Crash:", error);
        // This prevents the "Unexpected character: <" error on the phone
        return res.status(500).json({ message: "Server error during feedback" });
    }
};