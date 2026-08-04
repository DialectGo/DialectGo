# DialectGo Backend API Setup (Express.js)

This folder contains the Node.js / Express.js backend API for DialectGo.

## 🛠 Technology Stack
- **Core Framework:** Node.js, Express.js
- **Authentication & Database:** Supabase (`@supabase/supabase-js`)
- **Translation Engine:** Hugging Face via `@gradio/client`, Fallback Flask API via `axios`
- **LLM Processing:** Groq (`groq-sdk`), Gemini (`@google/genai` or standard fetch)
- **Audio & Media:** Google Cloud TTS (`@google-cloud/text-to-speech`), Tesseract.js (OCR), `express-fileupload`
- **Security:** JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `express-rate-limit`

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase Project (Database and Auth)
- A Groq Cloud API Key
- A Google Cloud Service Account JSON Key (for Text-to-Speech)

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
- **Translation Timeout:** If the primary Hugging Face API times out, ensure your Google Colab instance is running and the `COLAB_URL` is updated in your `.env`.
- **GCP Key Error:** If you get an error regarding `GOOGLE_APPLICATION_CREDENTIALS`, verify that the `gcp-key.json` file is present in `app/config/` and contains valid JSON.
