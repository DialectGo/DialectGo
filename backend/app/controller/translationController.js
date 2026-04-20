import axios from 'axios';
import Tesseract from 'tesseract.js';
import { TranslationModel } from '../models/translationModel.js';

export const translateImage = async (req, res) => {
    try {
        const { image, targetLang } = req.body;
        
        if (!image) return res.status(400).json({ message: "No image provided" });

        console.log("1. Starting OCR...");
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const { data: { text } } = await Tesseract.recognize(
            Buffer.from(base64Data, 'base64'), 
            'eng'
        );

        console.log("2. OCR Text extracted:", text);
        if (!text || text.trim().length === 0) throw new Error("OCR could not read text");

        console.log("3. Calling AI Translation...");
        const AI_ENDPOINT = process.env.COLAB_URL || "https://vaned-procompensation-enda.ngrok-free.dev/translate"; 

        const aiResponse = await axios.post(AI_ENDPOINT, { // Use AI_ENDPOINT here
            instruction: `Translate to ${targetLang}.`,
            input: text
        });

        // Now aiResponse is defined and we can access aiResponse.data.translation
        res.json({ status: 200, translatedText: aiResponse.data.translation });
        
    } catch (error) {
        console.error("CRITICAL BACKEND ERROR:", error);
        res.status(500).json({ message: "Processing failed: " + error.message });
    }
};

export const translateText = async (req, res) => {
    const { sourceText, sourceLang, targetLang } = req.body;
    const userId = req.user.id; // Assuming your authMiddleware populates req.user
    
    const COLAB_URL = "https://vaned-procompensation-enda.ngrok-free.dev/translate"; // Your Colab endpoint

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