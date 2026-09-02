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
 * Fetch the LLM breakdown analysis via Server-Sent Events (SSE).
 * This is the non-blocking alternative to requesting withBreakdown=true in translateText.
 *
 * Usage flow:
 *   1. Call translateText() — fast, no breakdown in response
 *   2. Display translated text immediately
 *   3. Call fetchBreakdownSSE() — resolves in 3-8s with breakdown data
 *   4. Render the breakdown panel
 *
 * @param {Object} params
 * @param {string} params.sourceText
 * @param {string} params.translatedText
 * @param {string} params.sourceLang
 * @param {string} params.targetLang
 * @param {string|null} params.targetDialect
 * @param {Object|null} params.preprocessingMeta
 * @param {string|number|null} params.translationId
 * @param {function} [params.onStatusUpdate] - Called with status strings during streaming
 * @returns {Promise<Object>} The full breakdown data object
 */
export const fetchBreakdownSSE = ({
  sourceText,
  translatedText,
  sourceLang,
  targetLang,
  targetDialect = null,
  preprocessingMeta = null,
  translationId = null,
  onStatusUpdate,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const session = await getValidSession();

      // React Native's fetch() doesn't natively support SSE, so we use a
      // manual streaming reader approach that works cross-platform.
      const response = await fetch(`${TRANSLATION_API_BASE}/translate/breakdown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sourceText,
          translatedText,
          sourceLang,
          targetLang,
          targetDialect,
          preprocessingMeta,
          translationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Breakdown request failed with status ${response.status}`);
      }

      // Read the streamed SSE response as text
      const text = await response.text();

      // Parse SSE events from the text stream
      const events = text.split('\n\n').filter(Boolean);

      for (const event of events) {
        const lines = event.split('\n');
        const eventType = lines.find(l => l.startsWith('event:'))?.replace('event:', '').trim();
        const dataLine = lines.find(l => l.startsWith('data:'))?.replace('data:', '').trim();

        if (!dataLine) continue;

        try {
          const parsed = JSON.parse(dataLine);

          if (eventType === 'ping') {
            onStatusUpdate?.('Analyzing...');
            continue;
          }

          if (eventType === 'breakdown' && parsed.success && parsed.breakdown) {
            resolve(parsed.breakdown);
            return;
          }

          if (eventType === 'error') {
            reject(new Error(parsed.message || 'Breakdown analysis failed'));
            return;
          }
        } catch {
          // Ignore malformed lines
        }
      }

      reject(new Error('Breakdown stream ended without a result'));
    } catch (err) {
      reject(err);
    }
  });
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
 * Images are automatically compressed before upload to speed up OCR.
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

  const mimeType = getMimeType(fileAsset);
  let uploadUri = fileAsset.uri;

  // ── Image Compression ─────────────────────────────────────────────────────
  // For images (not PDFs/DOCX), compress before upload to cut OCR processing
  // time by 50-80%. This is the single biggest win for image/document latency.
  if (mimeType.startsWith('image/')) {
    uploadUri = await compressImageForOCR(fileAsset.uri);
  }

  const formData = new FormData();
  
  // Append a timestamp to the filename to force React Native Android to treat it as a new file.
  // This bypasses a known OkHttp/FormData bug where uploading the exact same local URI twice hangs.
  const originalFileName = fileAsset.fileName || fileAsset.name || 'upload.jpg';
  const uniqueFileName = `${Date.now()}_${originalFileName}`;

  formData.append('file', {
    uri: uploadUri,
    name: uniqueFileName,
    type: mimeType,
  });
  formData.append('sourceLang', sourceLang);
  formData.append('targetLang', targetLang);
  if (targetDialect) formData.append('targetDialect', targetDialect);
  if (sourceLangId) formData.append('source_language_id', sourceLangId);
  if (targetLangId) formData.append('target_language_id', targetLangId);
  // withBreakdown removed — breakdown is now served via POST /translate/breakdown SSE endpoint

  const response = await fetch(`${API_URL}/document`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Document translation failed');
  }
  return response.json();
};

/**
 * Compresses and resizes an image before uploading for OCR.
 * Reduces OCR processing time by 50-80% for large phone camera photos.
 *
 * @param {string} imageUri - Local file URI from ImagePicker
 * @returns {Promise<string>} Compressed image URI
 */
export const compressImageForOCR = async (imageUri) => {
  try {
    // Lazy import so the module is only loaded when needed
    const ImageManipulator = await import('expo-image-manipulator');
    const manipulate = ImageManipulator.manipulateAsync ?? ImageManipulator.default?.manipulateAsync;

    if (!manipulate) {
      console.warn('[ImageCompressor] expo-image-manipulator not available, skipping compression');
      return imageUri;
    }

    const result = await manipulate(
      imageUri,
      [{ resize: { width: 1080 } }], // Downscale to max 1080px width, preserve aspect ratio
      { compress: 0.8, format: 'jpeg' }  // 80% JPEG quality
    );

    console.log(`[ImageCompressor] Compressed image: ${result.uri}`);
    return result.uri;
  } catch (err) {
    console.warn('[ImageCompressor] Compression failed, using original:', err.message);
    return imageUri; // Fallback to original image
  }
};
