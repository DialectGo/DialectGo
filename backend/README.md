# DialectGo Backend API Setup (Express.js)

This folder contains the Node.js / Express.js backend API for DialectGo.

## 🛠 Technology Stack
- **Core Framework:** Node.js, Express.js
- **Authentication & Database:** Supabase (`@supabase/supabase-js`)
- **Translation Engine:** Hugging Face via `@gradio/client`, Fallback Flask API via `axios`
- **LLM Meta-Layers:** Groq (`groq-sdk`), Gemini (`@google/genai`)
- **Document & Image OCR:** External Python FastAPI microservice (PaddleOCR) & Tesseract.js fallback
- **Audio & Media:** Google Cloud TTS (`@google-cloud/text-to-speech`), `multer` (for document/image uploads), `pdf-parse`, `mammoth` (DOCX parsing)
- **Security:** JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `express-rate-limit`

## ✨ Key Features & Architecture
The backend handles the core translation pipeline, enriched by several AI Meta-Layers:
- **Translation Preprocessing Pipeline:** Implements VSO POS inferencing, slang canonicalization, corpus lookups, and dialect-specific rules before translation.
- **LLM Meta-Layers:** Uses LLMs for contextual enhancements:
  - **Document Type Detection:** Identifies formality and domain (e.g., Casual Chat, Academic).
  - **Layout Reconstruction:** Uses OCR bounding boxes to reconstruct accurate Markdown paragraphs from flat text.
  - **Chat Slang Normalization:** Normalizes extreme slang and texting abbreviations before machine translation.
  - **Highlight & Ask:** Deep linguistic breakdown (grammar, roots, sentence structure) for any translated segment.
- **Admin System:** Endpoints for managing the centralized dialect corpus (adding/updating dictionary terms) and reviewing translation history.

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase Project (Database and Auth)
- A Groq Cloud API Key
- A Google Cloud Service Account JSON Key (for Text-to-Speech)
- A running instance of the `ocr-service` (PaddleOCR microservice)

## 1) Install dependencies

Navigate to the backend directory and install the required packages:

```bash
cd backend
npm install
```

## 2) Configure environment

Create a `.env` file in the root of the `backend` folder:

```bash
touch .env
```

Add the following environment variables into your `.env` file and replace the placeholders with your actual keys:

```env
# Supabase Configuration
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Machine Translation Fallback (Google Colab Ngrok URL)
COLAB_URL=https://your-colab-ngrok-url.ngrok-free.dev

# OCR Python Microservice URL
PADDLE_OCR_URL=http://localhost:8001

# AI LLM Keys
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key

# JWT Authentication for Admin routes
JWT_SECRET=your-very-secure-jwt-secret-key
JWT_EXPIRES_IN=8h

# Google Cloud Text-to-Speech (Relative path to your JSON key file)
GOOGLE_APPLICATION_CREDENTIALS="app/config/gcp-key.json"
```

## 3) Setup Google Cloud Credentials
For the Google Cloud Text-to-Speech service to work, you must generate a Service Account Key in JSON format from your Google Cloud Console.

Place the downloaded JSON file inside the `app/config/` directory and rename it to `gcp-key.json` (as referenced in the `.env` file).

## 4) Start development server

Start the backend API using the built-in Node watch mode for automatic restarts:

```bash
npm run dev
```

If you are running in production, use:

```bash
npm start
```

### Default URL & Ports
By default, the backend runs on **port 5001**.
- Local URL: `http://localhost:5001`
- LAN URL (for mobile app testing): `http://<your-local-ip>:5001`

**Important for Mobile Testing:** Make sure your computer's firewall allows incoming connections on port 5001 so the mobile app can reach the API.

## Troubleshooting

- **Supabase Errors:** Ensure your `SUPABASE_SERVICE_ROLE_KEY` is correct. The backend requires the service role key to bypass RLS for administrative tasks.
- **OCR Connection Refused:** Ensure the `ocr-service` Python FastAPI server is running on port 8001 and `PADDLE_OCR_URL` is set correctly.
- **Translation Timeout:** If the primary Hugging Face API times out, ensure your Google Colab instance is running and the `COLAB_URL` is updated in your `.env`.
- **GCP Key Error:** If you get an error regarding `GOOGLE_APPLICATION_CREDENTIALS`, verify that the `gcp-key.json` file is present in `app/config/` and contains valid JSON.
