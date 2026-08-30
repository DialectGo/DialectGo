# Dialect Corpus Data Entry Strategy

This guide is designed to help your data entry team (encoders) understand the structure, process, and guidelines for adding data to the **Dialect Corpus**. 

---

## 1. Division of Labor (Sector Assignment)

To make data entry efficient and avoid overlap, divide the workload among your 4 team members by mixing regional expertise with specific topics:

- **Member 1 (Luzon Focus)**: Focuses strictly on **General Tagalog & Batangueño**. They will encode basic vocabulary, family terms, greetings, and household items specific to these regions.
- **Member 2 (Visayas Focus)**: Focuses strictly on **General Cebuano & Boholano**. They will encode basic vocabulary, family terms, greetings, and household items specific to these regions.
- **Member 3 (Pop Culture & Modern Trends)**: Focuses on **Internet Slang, Social Media, Gaming, and Flirty/Romantic** words across *all* dialects.
- **Member 4 (Emotions, Situations & Actions)**: Focuses on words related to **Emotions (Angry, Happy, Sadness), Work, School, Food, and Gambling/Profanity** across *all* dialects.

---

## 2. Field Guide for Encoders

Here is a breakdown of every column your team will need to fill out, including allowed ranges and examples.

### `source_text`
- **What it is**: The regional word, phrase, or slang being added.
- **Rule**: Keep it lowercase unless it's a proper noun. Strip punctuation.
- **Example**: `delikado`, `kuyaw`, `charot`

### `standard_term`
- **What it is**: The standard equivalent translation (usually in General Tagalog or English) that everyone understands.
- **Example**: If source is `hinaw` (Batangueño), standard is `wash hands`.

### `dialect`
- **What it is**: The region or specific dialect the word belongs to.
- **Allowed Values**: Use exact, standardized names (e.g., `General Tagalog`, `General Cebuano`, `Batangueño`, `Boholano`, `Ilonggo`). *Establish a fixed dropdown or list so encoders don't make typos.*

### `part_of_speech`
- **What it is**: The grammatical function of the word.
- **Allowed Values**: `Noun`, `Verb`, `Adjective`, `Adverb`, `Pronoun`, `Preposition`, `Conjunction`, `Exclamation`, `Phrase`.

### `context_tag`
- **What it is**: The general conversational topic where this word is used.
- **Allowed Values**: `Family`, `Household`, `Angry`, `Happy`, `Pointer`, `Food`, `Internet Slang`, `School`, `Work`. (You can allow comma-separated tags if a word fits multiple).

### `status`
- **What it is**: The approval state of the word.
- **Rule**: Encoders should use **`validated`** if they are 100% sure of the translation, and **`pending`** if they are unsure and need a reviewer to check it.

---

## 3. Deep Dive: `sentiment_score`

In the DialectGo system, the `sentiment_score` currently acts as a **Category ID** mapping to a specific emotional or contextual tone. 

Encoders should use the following numeric values based on the tone of the word:
- **`0`**: Neutral (No specific emotion)
- **`1`**: Flirty / Romantic *(e.g., kilig, jowa)*
- **`2`**: Internet Slang / Gen-Z *(e.g., charot, slay)*
- **`3`**: Happy / Positive *(e.g., masaya, panalo)*
- **`4`**: Angry / Negative *(e.g., bwisit, galit)*
- **`5`**: Regional / Dialectal *(e.g., ala eh, bay)*
- **`6`**: Gambling / Betting *(e.g., pusta, sabong)*
- **`7`**: Food / Cooking *(e.g., luto, lami)*
- **`8`**: School / Academic *(e.g., bagsak, pasad)*
- **`9`**: Work / Hustle *(e.g., sahod, raket)*
- **`10`**: Gaming / Esports *(e.g., toxic, buhat)*
- **`11`**: Social Media *(e.g., viral, fyp)*
- **`12`**: Family / Kinship *(e.g., bunso, kuya)*
- **`13`**: Greetings / Pleasantries *(e.g., kamusta)*
- **`14`**: Sadness / Regret *(e.g., sayang, lungkot)*
- **`15`**: Profanity / Vulgar *(e.g., gago, yawa)*

> [!WARNING]
> **Developer Note for You:** Currently, your `sentiment.service.js` calculates the overall sentiment of a sentence by taking a weighted mathematical average of these IDs. Averaging category IDs (e.g., 4 [Angry] + 12 [Family] = 8 [School]) will result in skewed sentiment categorization. You may want to refactor this in the future so that `sentiment_score` strictly uses `-1.0` (Very Negative) to `1.0` (Very Positive) for mathematical averaging, while keeping categories separate!

---

## 4. Deep Dive: `weight`

The `weight` field determines **how strongly** a specific word influences the overall context or emotion of a sentence.

### How it works mathematically:
The AI calculates a sentence's overall sentiment using this formula: 
`Sentiment = Sum(Score × Weight) / Sum(Weights)`

Additionally, the AI automatically amplifies weights in two scenarios:
1. **Intensifiers**: If a user types an intensifier (like "sobra" or "grabe") before a word, the AI multiplies the word's weight by 1.5x.
2. **First Word (VSO)**: In Philippine languages, the first word (predicate) often carries the heaviest emotional weight, so the AI automatically multiplies its weight by 1.5x.

### How Encoders should assign `weight`:
Encoders should assign a decimal value usually between `1.0` and `2.0`:
- **`1.0` (Standard/Default)**: Use for 90% of normal words (e.g., *kain, bahay, upo*).
- **`1.2` - `1.5` (Heavy/Strong Words)**: Use for words that carry strong emotional or contextual impact, such as profanities, strong emotions, or highly specific cultural terms (e.g., *delikado, bwisit, kilig*). 
- **`1.5` - `2.0` (Defining Words)**: Use for words that completely alter the meaning of a sentence on their own.

**Example**: 
If encoding the word *kuyaw* (dangerous/scary), an encoder might give it a `sentiment_score` of `4` (Negative) and a `weight` of `1.5` because it is a strong word that dictates the mood of the sentence.
