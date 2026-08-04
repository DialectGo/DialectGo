# DialectGo Admin Dashboard Setup (React + Vite)

This folder contains the admin dashboard web application for DialectGo. It is used to manage users, the dictionary, user-recommended translations, and DialectWiki community submissions.

## 🛠 Technology Stack
- **Core Framework:** React (v19) with Vite
- **Authentication & Database:** Supabase (`@supabase/supabase-js`)
- **Data Visualization:** Chart.js & React-ChartJS-2
- **Styling:** Custom Vanilla CSS (Modern Glassmorphic UI)
- **Linting:** ESLint

## 📋 Prerequisites

- Node.js 18+ and npm
- A running backend API (see `../backend/README.md`)

## 1) Install dependencies

Navigate to the admin directory and install the required packages:

```bash
cd admin
npm install
```

## 2) Configure environment

Create an `.env` file in the root of the `admin` folder:

```bash
touch .env
```

Add the following environment variables into your `.env` file:

```env
# The local URL of your Express Backend (defaults to port 5001)
VITE_API_BASE_URL=http://localhost:5001/api

# Supabase Credentials for Authentication
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### ⚠️ Important Environment Rules:
- **Variable Prefix:** All environment variables accessed inside the React code must be prefixed exactly with `VITE_`. Variables without this prefix will not be bundled by Vite and will appear as `undefined`.
- **API URL:** Ensure you include `/api` at the end of the `VITE_API_BASE_URL` if your backend routes are prefixed with it.
- **Reloading:** If you edit the `.env` file while the development server is running, you must restart `npm run dev` so Vite can reload the new environment values.

## 3) Run the app

Start the Vite development server:

```bash
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173`).

## 4) Build and preview

To create a production build and preview it locally:

```bash
npm run build
npm run preview
```

## 5) Linting

To run the ESLint linter and check for code issues:

```bash
npm run lint
```

## Notes
- The Admin dashboard communicates directly with Supabase for authentication but routes all management actions (CRUD) through the Express backend via the `VITE_API_BASE_URL`.
- If you are running the backend on a different machine or IP address, make sure to update the `VITE_API_BASE_URL` to match (e.g., `http://192.168.1.72:5001/api`).
