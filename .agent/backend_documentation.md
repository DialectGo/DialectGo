# DialectGo - Backend Technical Documentation

This documentation provides an architectural and technical overview of the DialectGo backend system, detailing its components, database schemas, API interfaces, translation flow, and constraints.

---

## 1. Project Architecture Overview

DialectGo is a contextual language translation system designed to translate standard languages (e.g., English, Tagalog) into regional Philippine dialects (e.g., Batangas Tagalog, Cebuano) and parse localized slang.

The backend is built with **Node.js** and **Express.js**, using **Supabase** (PostgreSQL) as its database and authentication provider. 

### Core Architecture Layers:
1. **Routing Layer (`app/routes/`)**: Exposes REST API endpoints for translations, dictionary lookups, user profiles, streaks, and admin moderation.
2. **Middleware Layer (`app/middlewares/`)**: Handles session authentication (JWT/Supabase validation), rate-limiting, user validation, role-based authorization, and anomaly detection.
3. **Controller Layer (`app/controllers/`)**: Manages the request/response lifecycle, coordinates input parsing, and calls the appropriate service layers.
4. **Service Layer (`app/services/`)**: Orchestrates business logic, such as vector/text matches, machine translation client calls (Hugging Face / local Flask API), OCR via Tesseract, and Speech-to-Text.
5. **Model/Data Access Layer (`app/models/`)**: Abstracts database queries, handles CRUD operations, and logs historical transactions in Supabase.

---

## 2. Key API Endpoints & Services

### Translation Endpoints (Mounted under `/api/v1/translations`)

| Endpoint | Method | Middleware | Description |
| --- | --- | --- | --- |
| `/translate` | `POST` | `verifyToken`, `validateTranslateText` | Translates text, updates streak, and logs history. |
| `/translate/contribute` | `POST` | `verifyToken`, `validateUserTranslationSubmit` | Submits a user-recommended regional translation. |
| `/translate/image` | `POST` | `verifyToken`, `validateTranslateImage` | Performs OCR on base64 images and translates the text. |
| `/translate/audio` | `POST` | `verifyToken`, `upload.single('audio')` | Performs speech-to-text transcription and translates the audio. |
| `/history` | `GET` | `verifyToken` | Retrieves translation history for the authenticated user. |
| `/feedback` | `POST` | `verifyToken` | Submits user feedback (likes/ratings) for translations. |

### The Translation Flow Service (`performTranslation`)

The system follows a tiered translation flow:

1. **RAG Context Search:** The system fetches validated terms from `dialect_corpus`. It calculates overlap matching using token matching (`scoreCandidate`) and checks that the word ratio is at least 60% of the input text to prevent short phrases from hijacking long compound sentences.
2. **Exact Dialect Override:** If a high-scoring matching row is found and corresponds to the target language's region, it bypasses NLLB entirely and returns the community-validated regional translation directly.
3. **Source Slang Normalization:** If no direct override matches, the system searches for slang in the source text (e.g. `"tomguds"`) and replaces it with the standard word (e.g. `"gutom"`) before calling the NLLB model.
4. **Baseline Translation:** The normalized text is translated via Hugging Face Space Gradio client (`DialectGoOOO/TranslationCebTagEng`).
5. **Fallback Execution:** If Hugging Face is unreachable or fails, the query is routed to a local Flask service on Google Colab (specified by `COLAB_URL`).

---

## 3. Database Schema (Supabase/Models)

### Core Tables

#### `public.dialect_corpus`
Stores community-submitted, validated regional terms and slang translations used to augment/override the translation engine.
* `id`: `uuid` (Primary Key)
* `source_text`: `text` (The baseline terms/phrases)
* `dialect_translation`: `text` (The regional translation variant)
* `region`: `text` (e.g., `"Batangas"`, `"Cebu"`, `"English"`)
* `context_tag`: `text` (Categorized via taxonomy labels: `Slang`, `Colloquial`, `Regional`, `Formal`, `Archaic`, `Internet/Digital`, `Borrowing/Loan`, `Formal-Regional`)
* `status`: `text` (e.g., `"pending"`, `"validated"`, `"community_rejected"`)
* `embedding`: `vector` (384-dimensional vector using `multilingual-e5-small` for pgvector semantic search)
* `created_at`: `timestamp with time zone`

#### `public.translation_history`
Maintains user translation logs for dashboard statistics and active streak calculations.
* `id`: `serial` (Primary Key)
* `user_id`: `uuid` (Foreign Key -> auth.users)
* `source_text`: `text`
* `translated_text`: `text`
* `source_language_id`: `integer` (Foreign Key -> languages)
* `target_language_id`: `integer` (Foreign Key -> languages)
* `created_at`: `timestamp with time zone`

#### `public.user_recommended_translations`
Stores translation suggestions submitted by users awaiting admin review.
* `id`: `serial` (Primary Key)
* `user_id`: `uuid` (Foreign Key -> profiles)
* `source_text`: `text`
* `user_translation`: `text`
* `source_language_id`: `integer`
* `target_language_id`: `integer`
* `status`: `text` (e.g. `"pending"`, `"approved"`, `"denied"`)
* `created_at`: `timestamp with time zone`

#### `public.profiles`
Extends user account information including location, preferences, and activity streaks.
* `id`: `uuid` (Primary Key -> auth.users)
* `username`: `text`
* `first_name`: `text`
* `last_name`: `text`
* `preferred_language_code`: `text`
* `streak_count`: `integer` (Calculated dynamically as active consecutive days with 3+ translations)

---

## 4. Current Constraints & Fallback Logics

1. **Machine Translation Limitation:** Pure translation models (like NLLB-200) cannot parse system instructions/prompts (e.g. `"Translate this and use regional variant..."`) because they do not have conversational instruction-following capability. The system handles this constraint by applying direct database RAG overrides and pre-translation source text normalizations.
2. **Row Level Security (RLS) Anonymous Writes:** The backend's default `supabase` client is initialized globally with the `SUPABASE_ANON_KEY`, meaning all server database operations are executed under anonymous permissions. To write user-specific history logs (`translation_history`) or bookmarks, either RLS must be disabled for the table in Supabase, or specific policies must allow anonymous `insert`/`select`/`delete` calls.
3. **DNS/Network Failures:** In network-isolated, school-firewalled, or offline environments, Hugging Face API queries to Gradio will fail with `ENOTFOUND`. The translation service handles this by falling back to the local Flask backend tunnel (`COLAB_URL`), and the embedding service falls back from Hugging Face to OpenAI API endpoints if `OPENAI_API_KEY` is provided.
