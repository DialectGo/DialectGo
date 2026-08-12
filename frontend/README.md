# DialectGo Mobile App Setup (Expo)

This folder contains the React Native Expo mobile application for DialectGo.

## 🛠 Technology Stack
The frontend is built with a modern React Native stack:
- **Core Framework:** React Native (0.81.5) with Expo (v54)
- **Routing:** Expo Router (File-based routing)
- **Styling:** NativeWind (v4) with Tailwind CSS
- **Backend & Auth:** Supabase JS (`@supabase/supabase-js`)
- **UI Components:** React Native Paper & Lucide React Native (Icons), Bottom Sheets (`@gorhom/bottom-sheet` or built-in Modals)
- **Camera/Media:** Expo Camera, React Native Vision Camera, Nitro Modules, Expo Image Picker, Expo Document Picker
- **Networking:** Axios
- **File Management:** Expo File System (Legacy imports for broad compatibility)

## ✨ Key Features & Architecture
The frontend is heavily integrated with the backend AI Meta-Layers and Supabase:
- **Auth System:** Full authentication flow (Sign Up, Login, Password Reset, Profile Management) using Supabase Auth.
- **Document & Image Translation:** Users can upload images/PDFs/DOCX files. The UI handles chunked layout reconstruction, segment-by-segment highlighting, and document type badges (e.g., 'Casual Chat', 'Academic').
- **Highlight & Ask:** Tappable translated segments that open a bottom sheet offering deep linguistic breakdowns (grammar, roots, sentence structure) dynamically pulled from the LLM meta-layer.
- **Wiki Feeds:** A community-driven feed allowing users to share, upvote, and tag translations and dialect terms.
- **Admin Dashboard:** Specific `/admin` routes that allow administrators to manage the centralized dialect corpus (dictionary), review translation history, and manage users.
- **UI Enhancements:** A persistent, modern top navigation bar, seamless modal transitions, and dynamic SVG icons.

## 📋 Prerequisites

- Node.js 18+ and npm (or yarn)
- Expo CLI (optional globally, but helpful)
- Android Studio emulator, iOS Simulator, or a physical device with the Expo Go app installed.
- Running backend API (see `../backend/README.md`)

## 1) Install dependencies

Navigate to the frontend directory and install the required packages:

```bash
cd frontend
npm install
# or if using yarn
yarn install
```

## 2) Configure environment

Create an `.env` file in the root of the `frontend` folder. You can use `.env.example` if it exists, or create one manually:

```bash
touch .env
```

Add the following environment variables into your `.env` file:

```env
# The local IP address of your running Express Backend
EXPO_PUBLIC_API_BASE_URL=http://<your-local-ip>:5001

# Supabase Credentials for Authentication & Database
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Other API Keys
EXPO_PUBLIC_GROQ_API_KEY=your-groq-api-key
EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_URL=http://<your-ngrok-or-local-url>/auth/ChangePassword
```

### ⚠️ Important Environment Rules:
- **Use your machine's LAN IP** (e.g., `192.168.1.72`) for the API URL if you are testing on a physical device or Android Emulator. 
- **Do not use `127.0.0.1` or `localhost`** on physical devices, as it will point to the mobile device itself instead of your computer hosting the backend.
- How to get `<your-local-ip>`:
  - **Windows:** Run `ipconfig` in CMD and look for `IPv4 Address`.
  - **Mac:** Run `ipconfig getifaddr en0` in the terminal.
- All variables used in the React Native code **must** start with the `EXPO_PUBLIC_` prefix to be bundled correctly.
- If you edit the `.env` file while the server is running, you must fully restart Expo for the new values to load.

## 3) Start development server

Start the Expo bundler:

```bash
npm start
# or
npx expo start
```

### Running on a Device/Emulator:
- **Physical Device:** Open the Expo Go app on your phone and scan the QR code displayed in the terminal.
- **Android Emulator:** Press `a` in the terminal (ensure Android Studio and an emulator are running).
- **iOS Simulator:** Press `i` in the terminal (requires macOS and Xcode).
- **Web Browser:** Press `w` in the terminal.

## Troubleshooting

- **Network Errors (Network Request Failed):** Ensure your mobile device and your development computer are on the exact same Wi-Fi network. Verify that `EXPO_PUBLIC_API_BASE_URL` is set to your correct IPv4 address.
- **Cache Issues:** If NativeWind styles are not updating or environment variables are stuck, clear the bundler cache by starting Expo with the clear flag: `npx expo start -c`.
- **Camera/Native Module Errors:** Because this project uses custom native modules (like Vision Camera and Nitro), standard Expo Go might have limitations. If you encounter native module crashes, you may need to run a prebuild: `npx expo run:android` or `npx expo run:ios`.
