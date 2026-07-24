import { performTranslation } from '../services/translation.service.js';

const testCases = [
    {
        text: "Wash the dishes",
        sourceLang: "English",
        targetLang: "Tagalog",
        expectedDesc: "Exact match Batangas override"
    },
    {
        text: "Ayoko ngani",
        sourceLang: "Tagalog",
        targetLang: "Cebuano",
        expectedDesc: "Slang normalization ('ngani' -> 'nga') + NLLB translation to Cebuano"
    },
    {
        text: "Ayoko ngani",
        sourceLang: "Tagalog",
        targetLang: "English",
        expectedDesc: "Exact match English override"
    },
    {
        text: "Na para bang ang talino niya",
        sourceLang: "Tagalog",
        targetLang: "English",
        expectedDesc: "Exact match English override"
    },
    {
        text: "Na para bang ang talino niya",
        sourceLang: "Tagalog",
        targetLang: "Cebuano",
        expectedDesc: "Exact match Cebuano override"
    },
    {
        text: "aray ko po",
        sourceLang: "Tagalog",
        targetLang: "English",
        expectedDesc: "Exact match English override"
    },
    {
        text: "aray ko po",
        sourceLang: "Tagalog",
        targetLang: "Cebuano",
        expectedDesc: "Exact match Cebuano override"
    },
    {
        text: "Galit ako ngani",
        sourceLang: "Tagalog",
        targetLang: "Cebuano",
        expectedDesc: "Partial match: Slang normalization ('ngani' -> 'nga') to standard Tagalog, then NLLB translation to Cebuano"
    },
    {
        text: "I am going to wash the dishes.",
        sourceLang: "English",
        targetLang: "Tagalog",
        expectedDesc: "Looser overlap matching (scoreCandidate): Should override to 'Urungan mo ang mga plato'"
    },
    {
        text: "aray ko po. ayoko na ngani",
        sourceLang: "Tagalog",
        targetLang: "English",
        expectedDesc: "Compound sentence: Should NOT trigger override for 'aray ko po', and should normalize 'ngani' -> 'nga'"
    }
];

async function runTests() {
    console.log("=== STARTING TRANSLATION PIPELINE TESTS ===");
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        console.log(`\nTest #${i + 1}: "${tc.text}" (${tc.sourceLang} -> ${tc.targetLang})`);
        console.log(`Expected Behavior: ${tc.expectedDesc}`);
        try {
            const output = await performTranslation(tc.text, tc.sourceLang, tc.targetLang);
            console.log(`Output: "${output}"`);
        } catch (err) {
            console.error(`Failed: ${err.message}`);
        }
    }
    console.log("\n=== TESTS COMPLETE ===");
    process.exit(0);
}

runTests();
