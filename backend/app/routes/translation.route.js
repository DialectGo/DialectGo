// translation.route.js
import express from 'express';
import { 
    translateText, 
    getUserHistory, 
    submitFeedback, 
    translateImage, 
    translateAudio, 
    translateDocument,
    translateDocumentBase64,
    downloadDocument,
    submitUserTranslation, 
    customizeTranslation,
    explainSegment,
    textToSpeech,
    streamBreakdown,
    toggleBookmark,
    getSavedTranslations,
    adminGetAllHistory, 
    adminGetAllRecommendations, 
    adminGetTranslationAnalytics 
} from '../controllers/translation.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js'; 
import { validateTranslateText, validateTranslateImage, validateUserTranslationSubmit, validateCustomizeRequest } from '../middlewares/validate.middleware.js';
import multer from 'multer';

// ─── File Upload Limits ───────────────────────────────────────────────────────
// Hard cap: 2 MB per file upload. This is enforced BEFORE any processing starts.
// Keeps HuggingFace and Groq API usage within safe bounds for the free tier.
const FILE_SIZE_LIMIT_MB = 2;
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 },
});

const router = express.Router();
const translateRouter = express.Router();

translateRouter.post('/', verifyToken, validateTranslateText, translateText);
translateRouter.post('/contribute', verifyToken, validateUserTranslationSubmit, submitUserTranslation);
translateRouter.post('/image', verifyToken, validateTranslateImage, translateImage);
translateRouter.post('/audio', verifyToken, upload.single('audio'), translateAudio);
translateRouter.post('/document', verifyToken, upload.single('file'), translateDocument);
translateRouter.post('/document-base64', verifyToken, translateDocumentBase64);
translateRouter.post('/download', verifyToken, downloadDocument);
translateRouter.post('/customize', verifyToken, validateCustomizeRequest, customizeTranslation);
translateRouter.post('/explain-segment', verifyToken, explainSegment);
translateRouter.post('/tts', verifyToken, textToSpeech);

// SSE endpoint: decoupled LLM breakdown (async, non-blocking)
// Client calls this AFTER receiving the translated text to get the linguistic breakdown
translateRouter.post('/breakdown', verifyToken, streamBreakdown);

// Mount the translate router under /translate
router.use('/translate', translateRouter);

// ─── Multer File Size Error Handler ──────────────────────────────────────────
// Catches multer's LIMIT_FILE_SIZE error and returns a clean JSON response
// instead of a raw unhandled crash. Must be placed AFTER router.use().
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            error: 'FILE_TOO_LARGE',
            message: `The file you uploaded is too large. The maximum allowed file size is ${FILE_SIZE_LIMIT_MB} MB. Please use a smaller document or image (approximately 1–2 pages).`,
        });
    }
    next(err);
});

// Other routes that don't fit under /translate
router.get('/history', verifyToken, getUserHistory);
router.post('/feedback', verifyToken, submitFeedback);

router.post('/:id/bookmark', verifyToken, toggleBookmark);
router.get('/bookmarks', verifyToken, getSavedTranslations);

// --- DUAL-CONTROL WORKSPACE MANAGEMENT ENDPOINTS ---
// Cleaned: Removed duplicate prefixes and standardized role string to lowercase 'admin'
router.get('/admin/history', verifyToken, authorizeRole('admin'), adminGetAllHistory);
router.get('/admin/recommendations', verifyToken, authorizeRole('admin'), adminGetAllRecommendations);
router.get('/admin/analytics/daily', verifyToken, authorizeRole('admin'), adminGetTranslationAnalytics);

export default router;