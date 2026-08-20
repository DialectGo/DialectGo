/**
 * DialectGo — Translation Service
 *
 * Handles all calls to the core translation API (translate, TTS, feedback, customize, document).
 */
import { TRANSLATION_API_BASE } from '../../api/client';
import { getValidSession } from '../authService';

const API_URL = `${TRANSLATION_API_BASE}/translate`;
const FEEDBACK_URL = `${TRANSLATION_API_BASE}/feedback`;

/**
 * Translates a text string between two languages.
 *
 * @param {Object} params
 * @param {string} params.sourceText
 * @param {string} params.sourceLang
 * @param {string} params.targetLang
 * @param {string|null} params.targetDialect
 * @param {number} params.sourceLangId
 * @param {number} params.targetLangId
 * @param {boolean} [params.withBreakdown=false]
 * @returns {Promise<Object>} { translatedText, historyId, breakdown }
 */
export const translateText = async ({
  sourceText,
  sourceLang,
  targetLang,
  targetDialect,
  sourceLangId,
  targetLangId,
  withBreakdown = false,
}) => {
  const session = await getValidSession();

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      sourceText,
      sourceLang,
      targetLang,
      targetDialect,
      source_language_id: sourceLangId,
      target_language_id: targetLangId,
      withBreakdown,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Translation failed');
  return data;
};

/**
 * Fetches text-to-speech audio for a given translation.
 *
 * @param {string} text - Text to synthesize
 * @param {string} lang - Language code
 * @returns {Promise<string>} Raw base64 audio string
 */
export const fetchTTS = async (text, lang) => {
  const session = await getValidSession();

  const response = await fetch(`${TRANSLATION_API_BASE}/translate/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ text, lang }),
  });

  if (!response.ok) throw new Error('TTS request failed');
  const data = await response.json();
  if (!data.audioBase64) throw new Error('No audio returned');
  return data.audioBase64;
};

/**
 * Submits a simple rating (like/unlike) for a translation.
 *
 * @param {string|number} translationId
 * @param {number} rating - 5 for like, 1 for unlike
 * @returns {Promise<void>}
 */
export const submitRating = async (translationId, rating) => {
  const session = await getValidSession();

  await fetch(FEEDBACK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ translationId, rating }),
  });
};

/**
 * Submits detailed feedback (comment + suggestion) for a translation.
 *
 * @param {Object} params
 * @param {string|number} params.translationId
 * @param {number} params.rating
 * @param {string} [params.comment]
 * @param {string} [params.suggestionText]
 * @param {string} [params.sourceText]
 * @param {string} [params.sourceLang]
 * @param {string} [params.targetLang]
 * @param {number} [params.sourceLangId]
 * @param {number} [params.targetLangId]
 * @returns {Promise<void>}
 */
export const submitDetailedFeedback = async ({
  translationId,
  rating,
  comment,
  suggestionText,
  sourceText,
  sourceLang,
  targetLang,
  sourceLangId,
  targetLangId,
}) => {
  const session = await getValidSession();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };

  if (comment?.trim()) {
    await fetch(FEEDBACK_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ translationId, rating, comment }),
    });
  }

  if (suggestionText?.trim()) {
    await fetch(`${API_URL}/contribute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sourceText,
        userTranslation: suggestionText,
        sourceLang,
        targetLang,
        source_language_id: sourceLangId,
        target_language_id: targetLangId,
      }),
    });
  }
};

/**
 * Applies customization parameters to an existing translation.
 *
 * @param {Object} params
 * @param {string} params.sourceText
 * @param {string} params.translatedText
 * @param {string} params.sourceLang
 * @param {string} params.targetLang
 * @param {Object} params.options - Additional customize options (formality, dialect, etc.)
 * @returns {Promise<string>} The customized translated text
 */
export const customizeTranslation = async ({
  sourceText,
  translatedText,
  sourceLang,
  targetLang,
  options = {},
}) => {
  const session = await getValidSession();

  const response = await fetch(`${API_URL}/customize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ sourceText, translatedText, sourceLang, targetLang, ...options }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to customize translation');
  }
  return data.customizedText?.trim();
};

/**
 * Uploads and translates a document file.
 *
 * @param {Object} params
 * @param {Object} params.fileAsset - { uri, fileName, mimeType }
 * @param {string} params.sourceLang
 * @param {string} params.targetLang
 * @param {string|null} params.targetDialect
 * @param {number} params.sourceLangId
 * @param {number} params.targetLangId
 * @returns {Promise<Object>} The translation result data
 */
export const translateDocument = async ({
  fileAsset,
  sourceLang,
  targetLang,
  targetDialect,
  sourceLangId,
  targetLangId,
}) => {
  const session = await getValidSession();

  const getMimeType = (asset) => {
    if (asset.mimeType) return asset.mimeType;
    if (asset.uri?.toLowerCase().endsWith('.pdf')) return 'application/pdf';
    if (asset.uri?.toLowerCase().endsWith('.docx'))
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return 'image/jpeg';
  };

  const formData = new FormData();
  formData.append('file', {
    uri: fileAsset.uri,
    name: fileAsset.fileName || fileAsset.name || 'upload.jpg',
    type: getMimeType(fileAsset),
  });
  formData.append('sourceLang', sourceLang);
  formData.append('targetLang', targetLang);
  if (targetDialect) formData.append('targetDialect', targetDialect);
  if (sourceLangId) formData.append('source_language_id', sourceLangId);
  if (targetLangId) formData.append('target_language_id', targetLangId);
  formData.append('withBreakdown', 'true');

  const response = await fetch(`${API_URL}/document`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: formData,
  });

  if (!response.ok) throw new Error('Document translation failed');
  return response.json();
};
