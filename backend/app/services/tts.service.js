import textToSpeech from '@google-cloud/text-to-speech';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service-account credentials directly from the JSON key file
const keyFilePath = path.resolve(__dirname, '../config/gcp-key.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

const client = new textToSpeech.TextToSpeechClient({
    credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
    },
    projectId: serviceAccount.project_id,
});


/**
 * Map DialectGo language names to Google Cloud TTS language codes + voice names.
 * Filipino (fil-PH) covers both Tagalog and Cebuano text for pronunciation.
 * English uses a standard en-US voice.
 */
const VOICE_MAP = {
    English: { languageCode: 'en-US', name: 'en-US-Neural2-F' },
    Tagalog: { languageCode: 'fil-PH', name: 'fil-PH-Neural2-A' },
    Cebuano: { languageCode: 'fil-PH', name: 'fil-PH-Neural2-A' },
};

/**
 * Synthesize speech from text using Google Cloud Text-to-Speech.
 *
 * @param {string} text     - The translated text to speak
 * @param {string} language - DialectGo language name (English | Tagalog | Cebuano)
 * @returns {Promise<string>} Base64-encoded MP3 audio
 */
export const synthesizeSpeech = async (text, language = 'English') => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        console.warn('[TTS] Empty text, skipping synthesis');
        return null;
    }

    const voice = VOICE_MAP[language] || VOICE_MAP.English;

    const request = {
        input: { text: text.trim() },
        voice: {
            languageCode: voice.languageCode,
            name: voice.name,
        },
        audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0,
        },
    };

    try {
        const [response] = await client.synthesizeSpeech(request);

        // response.audioContent is a Buffer — convert to base64
        const audioBase64 = Buffer.from(response.audioContent).toString('base64');
        console.log(`[TTS] Synthesized ${audioBase64.length} chars of base64 audio for "${text.substring(0, 40)}..." (${voice.languageCode})`);
        return audioBase64;
    } catch (err) {
        console.error('[TTS] Google Cloud TTS error:', err.message);
        // Non-fatal: return null so the response still works without audio
        return null;
    }
};
