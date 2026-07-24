import { supabaseAdmin } from '../config/db.js';

// ─── Original Dialect Corpus Seeds ──────────────────────────────────────────
const testSeeds = [
    {
        source_text: "ngani",
        dialect_translation: "nga",
        region: "Batangas",
        context_tag: "Regional, Slang",
        status: "validated"
    },
    {
        source_text: "Ayoko ngani",
        dialect_translation: "Dili gyud ko",
        region: "Cebu",
        context_tag: "Regional, Slang",
        status: "validated"
    },
    {
        source_text: "tomguds",
        dialect_translation: "hungry",
        region: "English",
        context_tag: "Slang",
        status: "validated"
    },
    {
        source_text: "tomguds",
        dialect_translation: "gutom",
        region: "Batangas",
        context_tag: "Slang",
        status: "validated"
    },
    {
        source_text: "tomguds",
        dialect_translation: "gutom",
        region: "Cebu",
        context_tag: "Slang",
        status: "validated"
    },
    {
        source_text: "Na para bang ang talino niya",
        dialect_translation: "As if he/she is so smart.",
        region: "English",
        context_tag: "Colloquial, Internet/Digital",
        status: "validated"
    },
    {
        source_text: "Na para bang ang talino niya",
        dialect_translation: "Mora bag maalamon kaayo siya.",
        region: "Cebu",
        context_tag: "Colloquial, Regional",
        status: "validated"
    },
    {
        source_text: "aray ko po",
        dialect_translation: "Ouch!",
        region: "English",
        context_tag: "Colloquial",
        status: "validated"
    },
    {
        source_text: "aray ko po",
        dialect_translation: "Agay nako!",
        region: "Cebu",
        context_tag: "Colloquial, Regional",
        status: "validated"
    }
];

// ─── Pre-Processing Pipeline Seeds (with sentiment_score, weight, standard_term) ─
const preprocessingSeeds = [
    // "Bet" — Flirty context (Gusto)
    {
        source_text: "bet",
        dialect_translation: "gusto",
        standard_term: "gusto",
        sentiment_score: 1.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Flirty, Internet Slang",
        status: "validated"
    },
    // "Bet" — Gambling context (Pusta)
    {
        source_text: "bet",
        dialect_translation: "pusta",
        standard_term: "pusta",
        sentiment_score: 6.0,
        weight: 2,
        region: "Tagalog",
        context_tag: "Gambling",
        status: "validated"
    },
    // "Lodi" — Internet slang for idol
    {
        source_text: "lodi",
        dialect_translation: "idol",
        standard_term: "idol",
        sentiment_score: 2.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Internet Slang",
        status: "validated"
    },
    // "Eabab" — Reversed slang for babe
    {
        source_text: "eabab",
        dialect_translation: "babe",
        standard_term: "mahal",
        sentiment_score: 1.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Flirty, Internet Slang",
        status: "validated"
    },
    // "Sanaol" / "Sana all" — Internet slang
    {
        source_text: "sanaol",
        dialect_translation: "sana lahat",
        standard_term: "sana lahat",
        sentiment_score: 3.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Internet Slang, Happy",
        status: "validated"
    },
    {
        source_text: "sana all",
        dialect_translation: "sana lahat",
        standard_term: "sana lahat",
        sentiment_score: 3.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Internet Slang, Happy",
        status: "validated"
    },
    // "Ngani" — Regional Batangeño for "nga"
    {
        source_text: "ngani",
        dialect_translation: "nga",
        standard_term: "nga",
        sentiment_score: 5.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Regional, Batangeño",
        status: "validated"
    },
    // "Bad trip" — Angry/Negative slang
    {
        source_text: "bad trip",
        dialect_translation: "nakakagalit",
        standard_term: "nakakagalit",
        sentiment_score: 4.0,
        weight: 3,
        region: "Tagalog",
        context_tag: "Angry, Slang",
        status: "validated"
    },
    // "Sarap" — Happy/Positive (food context)
    {
        source_text: "sarap",
        dialect_translation: "masarap",
        standard_term: "masarap",
        sentiment_score: 3.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Happy, Positive",
        status: "validated"
    },
    // "Sarap" — Flirty context
    {
        source_text: "sarap",
        dialect_translation: "kaakit-akit",
        standard_term: "kaakit-akit",
        sentiment_score: 1.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Flirty",
        status: "validated"
    },
    // "Charot" — Internet slang for "joke lang"
    {
        source_text: "charot",
        dialect_translation: "joke lang",
        standard_term: "biro lang",
        sentiment_score: 2.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Internet Slang",
        status: "validated"
    },
    // "Werpa" — Internet slang for "power" (reversed)
    {
        source_text: "werpa",
        dialect_translation: "power",
        standard_term: "lakas",
        sentiment_score: 3.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Internet Slang, Happy",
        status: "validated"
    },
    // "Petmalu" — Internet slang for "malupit" (reversed)
    {
        source_text: "petmalu",
        dialect_translation: "malupit",
        standard_term: "mahusay",
        sentiment_score: 3.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Internet Slang, Happy",
        status: "validated"
    },
    // "G" / "Ge" — Internet slang for "game" / "sige"
    {
        source_text: "g",
        dialect_translation: "game",
        standard_term: "sige",
        sentiment_score: 2.0,
        weight: 1,
        region: "Tagalog",
        context_tag: "Internet Slang",
        status: "validated"
    },
    // "Awit" — Internet slang for sadness/disappointment
    {
        source_text: "awit",
        dialect_translation: "sayang",
        standard_term: "nakakalungkot",
        sentiment_score: 4.0,
        weight: 2,
        region: "Tagalog",
        context_tag: "Negative, Internet Slang",
        status: "validated"
    }
];

// ─── Seed Runner ────────────────────────────────────────────────────────────

async function upsertSeed(seedItem) {
    // Build the match criteria: source_text + region + sentiment_score (if present)
    let query = supabaseAdmin
        .from('dialect_corpus')
        .select('id')
        .eq('source_text', seedItem.source_text)
        .eq('region', seedItem.region);

    // For preprocessing seeds with sentiment_score, also match on that to allow
    // multiple entries for the same term with different sentiment contexts
    if (seedItem.sentiment_score !== undefined) {
        query = query.eq('sentiment_score', seedItem.sentiment_score);
    }

    const { data: existing, error: checkError } = await query.limit(1);

    if (checkError) {
        console.error(`  ✗ Error checking duplicate for "${seedItem.source_text}":`, checkError.message);
        return;
    }

    if (existing && existing.length > 0) {
        // Update the existing entry
        const updatePayload = {
            dialect_translation: seedItem.dialect_translation,
            context_tag: seedItem.context_tag,
        };
        if (seedItem.standard_term !== undefined) updatePayload.standard_term = seedItem.standard_term;
        if (seedItem.sentiment_score !== undefined) updatePayload.sentiment_score = seedItem.sentiment_score;
        if (seedItem.weight !== undefined) updatePayload.weight = seedItem.weight;

        const { error: updateError } = await supabaseAdmin
            .from('dialect_corpus')
            .update(updatePayload)
            .eq('id', existing[0].id);

        if (updateError) {
            console.error(`  ✗ Error updating "${seedItem.source_text}":`, updateError.message);
        } else {
            console.log(`  ↻ Updated "${seedItem.source_text}" → "${seedItem.dialect_translation}" (${seedItem.region})`);
        }
    } else {
        const { error: insertError } = await supabaseAdmin
            .from('dialect_corpus')
            .insert([seedItem])
            .select();

        if (insertError) {
            console.error(`  ✗ Error inserting "${seedItem.source_text}":`, insertError.message);
        } else {
            console.log(`  ✓ Seeded "${seedItem.source_text}" → "${seedItem.dialect_translation}" (${seedItem.region})`);
        }
    }
}

async function seed() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  Seeding dialect_corpus — Original entries");
    console.log("═══════════════════════════════════════════════════════════");
    for (const seedItem of testSeeds) {
        await upsertSeed(seedItem);
    }

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  Seeding dialect_corpus — Pre-processing pipeline entries");
    console.log("═══════════════════════════════════════════════════════════");
    for (const seedItem of preprocessingSeeds) {
        await upsertSeed(seedItem);
    }

    console.log("\n✅ Seeding complete!");
}

seed().catch(err => console.error("Uncaught seed error:", err));
