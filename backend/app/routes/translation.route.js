// translation.route.js
import express from 'express';
import { 
    translateText, 
    getUserHistory, 
    submitFeedback, 
    translateImage, 
    translateAudio, 
    translateDocument,
    downloadDocument,
    submitUserTranslation, 
    customizeTranslation,
    explainSegment,
    adminGetAllHistory, 
    adminGetAllRecommendations, 
    adminGetTranslationAnalytics 
} from '../controllers/translation.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js'; 
import { validateTranslateText, validateTranslateImage, validateUserTranslationSubmit, validateCustomizeRequest } from '../middlewares/validate.middleware.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const translateRouter = express.Router();

translateRouter.post('/', verifyToken, validateTranslateText, translateText);
translateRouter.post('/contribute', verifyToken, validateUserTranslationSubmit, submitUserTranslation);
translateRouter.post('/image', verifyToken, validateTranslateImage, translateImage);
translateRouter.post('/audio', verifyToken, upload.single('audio'), translateAudio);
translateRouter.post('/document', verifyToken, upload.single('file'), translateDocument);
translateRouter.post('/download', verifyToken, downloadDocument);
translateRouter.post('/customize', verifyToken, validateCustomizeRequest, customizeTranslation);
translateRouter.post('/explain-segment', verifyToken, explainSegment);

// Mount the translate router under /translate
router.use('/translate', translateRouter);

// Other routes that don't fit under /translate
router.get('/history', verifyToken, getUserHistory);
router.post('/feedback', verifyToken, submitFeedback);

// --- DUAL-CONTROL WORKSPACE MANAGEMENT ENDPOINTS ---
// Cleaned: Removed duplicate prefixes and standardized role string to lowercase 'admin'
router.get('/admin/history', verifyToken, authorizeRole('admin'), adminGetAllHistory);
router.get('/admin/recommendations', verifyToken, authorizeRole('admin'), adminGetAllRecommendations);
router.get('/admin/analytics/daily', verifyToken, authorizeRole('admin'), adminGetTranslationAnalytics);

export default router;