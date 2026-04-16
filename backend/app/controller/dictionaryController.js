import { supabase, connectDB } from '../config/db.js';

/**
 * @desc    Search for a word in the trilingual dictionary
 * @route   GET /api/dictionary/:word
 */
export const getWordDefinition = async (req, res) => {
    try {
        const { word } = req.params;

        if (!word) {
            return res.status(400).json({ message: "Search term is required" });
        }

        // Search across English, Tagalog, and Cebuano columns
        const { data, error } = await supabase
            .from('dictionary')
            .select('*')
            .or(`english.ilike.%${word}%,tagalog.ilike.%${word}%,cebuano.ilike.%${word}%`)
            .maybeSingle(); // This is safer than .single()

        if (error) {
            console.error("Supabase Error:", error.message);
            return res.status(500).json({ error: error.message });
        }

        if (!data) {
            return res.status(404).json({ message: "Word not found" });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};