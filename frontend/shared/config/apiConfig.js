// config/apiConfig.js
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.73:5001';
export const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
export const DICTIONARY_BASE_URL = `${API_BASE_URL}/api/dictionary`;
export const WORD_OF_DAY = `${DICTIONARY_BASE_URL}/word-of-the-day`;
export const DICTIONARY_BROWSE = `${DICTIONARY_BASE_URL}/browse`;
export const PASSWORD_RESET_REDIRECT_URL = process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_URL || 'http://dialectgo-colab.ngrok-free.dev/auth/ChangePassword';
// General API base (non-dictionary) for endpoints under /api
export const API_API_BASE = `${API_BASE_URL}/api`;
export const TRANSLATION_API_BASE = `${API_BASE_URL}/api/v1/translations`;
export const WIKI_API_BASE = `${API_BASE_URL}/api/wiki`;
export const NOTIFICATIONS_API_BASE = `${API_BASE_URL}/api/notifications`;
export const ACTIVITIES_API_BASE = `${API_BASE_URL}/api/activities`;

export const endpoints = {
  USER_PROFILE: `${API_BASE_URL}/api/v1/users/profile`,
  USER_STREAK: `${API_BASE_URL}/api/v1/users/streak`,
  USER_REGISTER: `${API_BASE_URL}/api/v1/users/register`,
  USER_LOGIN: `${API_BASE_URL}/api/v1/users/login`,
  GUEST_LOGIN: `${API_BASE_URL}/api/v1/users/guest-login`,
  DICTIONARY_SEARCH: `${DICTIONARY_BASE_URL}/search`,
  DICTIONARY_BASE: DICTIONARY_BASE_URL,
  DICTIONARY_HISTORY: `${DICTIONARY_BASE_URL}/history`,
  DICTIONARY_HISTORY_DELETE: `${DICTIONARY_BASE_URL}/history/delete-multiple`,
  DICTIONARY_SAVE: `${DICTIONARY_BASE_URL}/save`,
  DICTIONARY_CHECK_SAVED: `${DICTIONARY_BASE_URL}/check-saved`,
  DICTIONARY_SAVED: `${DICTIONARY_BASE_URL}/saved`,
  WORD_OF_DAY: WORD_OF_DAY,
  DICTIONARY_BROWSE: DICTIONARY_BROWSE,
  PASSWORD_RESET_REDIRECT_URL: PASSWORD_RESET_REDIRECT_URL,
  GROQ_API_KEY,
};

export default {
  API_BASE_URL,
  endpoints,
};
