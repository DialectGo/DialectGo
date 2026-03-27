import express from 'express';
import { translateText } from '../controller/translationController.js';
import verifyToken from '../middlewares/auth.js'; // Import your new auth middleware

const router = express.Router();

// Only logged-in users can use the translation feature
router.post('/translate', verifyToken, translateText);

export default router;