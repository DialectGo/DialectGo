# DialectGo

DialectGo is a full-stack, AI-powered multi-tenant platform designed to translate and preserve Philippine regional dialects. The repository is composed of a Node.js backend API, a React Admin dashboard, and a React Native Expo mobile application.

## Main Folders

### `backend/`
Node.js and Express 5 API business logic.
- Orchestrates the multi-stage AI translation pipeline (NLLB, Google TTS, Groq Llama 3.3).
- Handles authentication, dictionary logic, DialectWiki logic, and administration endpoints.
- Connects to Supabase for persistent data storage and authentication.
- **Read setup guide:** `backend/README.md`

### `admin/`
React + Vite admin web application.
- Provides an admin-facing UI with a modern glassmorphic design.
- Includes dashboards for managing Users, the Dictionary, Translations, and DialectWiki submissions.
- Calls the backend API through an environment-based base URL.
- **Read setup guide:** `admin/README.md`

### `frontend/`
React Native + Expo mobile application.
- The primary interface for users to translate text, audio, and images.
- Integrates crowdsourcing through DialectWiki and user-recommended translations.
- Uses Expo Router for navigation and NativeWind (Tailwind) for styling.
- **Read setup guide:** `frontend/README.md`

## Setup Navigation

From the project root, change directory into the app you want to set up, then follow that folder's specific `README.md` for detailed instructions.

```bash
cd backend
# Read and follow backend/README.md

cd ../admin
# Read and follow admin/README.md

cd ../frontend
# Read and follow frontend/README.md
```

> **Note:** This root `README.md` is intentionally a high-level guide only. Please refer to the specific folder documentation for environment variable configurations, installation commands, and troubleshooting.