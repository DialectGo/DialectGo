import express from 'express';
import { 
    getWordDefinition, 
    saveWord, 
    getSavedWords 
} from '../controllers/dictionaryController.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { validateDictionarySave } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Public routes
router.get('/search/:term', verifyToken, getWordDefinition);

// Protected routes
router.post('/save', verifyToken, validateDictionarySave, saveWord);
router.get('/saved', verifyToken, getSavedWords);

export default router;