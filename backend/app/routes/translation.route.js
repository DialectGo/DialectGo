import express from 'express';
import { translateText, getUserHistory, submitFeedback, translateImage, submitUserTranslation } from '../controllers/translation.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { validateTranslateText, validateTranslateImage, validateUserTranslationSubmit } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Create a sub-router for translation-related routes
const translateRouter = express.Router();

// Translation routes
translateRouter.post('/', verifyToken, validateTranslateText, translateText);
translateRouter.post('/contribute', verifyToken, validateUserTranslationSubmit, submitUserTranslation);
translateRouter.post('/image', verifyToken, validateTranslateImage, translateImage);

// Mount the translate router under /translate
router.use('/translate', translateRouter);

// Other routes that don't fit under /translate
router.get('/history', verifyToken, getUserHistory);
router.post('/feedback', verifyToken, submitFeedback);

export default router;