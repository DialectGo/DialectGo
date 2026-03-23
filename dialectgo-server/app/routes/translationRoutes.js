import express from 'express';
import { translateText } from '../controller/translationController.js';
const router = express.Router();

router.post('/translate', translateText);
export default router;