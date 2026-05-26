// translation.route.js
import express from 'express';
import { 
    translateText, 
    getUserHistory, 
    submitFeedback, 
    translateImage, 
    translateAudio, 
    submitUserTranslation, 
    adminGetAllHistory, 
    adminGetAllRecommendations, 
    adminGetTranslationAnalytics 
} from '../controllers/translation.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js'; 
import { validateTranslateText, validateTranslateImage, validateUserTranslationSubmit } from '../middlewares/validate.middleware.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// --- PLATFORM ENGINE COMPONENT ROUTING ---
// Cleaned: Removed duplicate path sub-structures assuming mount point handles '/api/v1' or relative base
router.post('/translations', verifyToken, validateTranslateText, translateText);
router.post('/translations/image', verifyToken, translateImage); 
router.post('/translations/audio', verifyToken, upload.single('audio'), translateAudio);
router.post('/translations/contribute', verifyToken, validateUserTranslationSubmit, submitUserTranslation);
router.get('/translations/history', verifyToken, getUserHistory);
router.post('/translations/feedback', verifyToken, submitFeedback);

// --- DUAL-CONTROL WORKSPACE MANAGEMENT ENDPOINTS ---
// Cleaned: Removed duplicate prefixes and standardized role string to lowercase 'admin'
router.get('/admin/history', verifyToken, authorizeRole('admin'), adminGetAllHistory);
router.get('/admin/recommendations', verifyToken, authorizeRole('admin'), adminGetAllRecommendations);
router.get('/admin/analytics/daily', verifyToken, authorizeRole('admin'), adminGetTranslationAnalytics);

export default router;