import dotenv from 'dotenv';
dotenv.config();

import { performPreprocessedTranslation } from './app/services/translation.service.js';

async function test() {
    try {
        console.log("Starting translation test...");
        const result = await performPreprocessedTranslation("Bet kita!", "Tagalog", "Cebuano", "Boholano");
        console.log("Success:", result);
    } catch (e) {
        console.error("Failed:", e);
    }
}

test();
