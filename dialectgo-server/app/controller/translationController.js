import axios from 'axios';

export const translateText = async (req, res) => {
    const { sourceText, sourceLang, targetLang } = req.body;
    
    // THE NGROK URL FROM YOUR COLAB OUTPUT
    const COLAB_URL = "https://vaned-procompensation-enda.ngrok-free.dev/translate";

    try {
        const response = await axios.post(COLAB_URL, {
            instruction: `Translate from ${sourceLang} to ${targetLang}.`,
            input: sourceText
        });

        res.json({
            status: 200,
            translatedText: response.data.translation
        });
    } catch (error) {
        console.error("Colab Error:", error.message);
        res.status(500).json({ message: "AI Engine is offline" });
    }
};