import express from 'express';
import { 
    getWordDefinition, 
    saveWord, 
    getSavedWords 
} from '../controller/dictionaryController.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/search/:term', verifyToken, getWordDefinition);

// Protected routes
router.post('/save', verifyToken, saveWord);
router.get('/saved', verifyToken, getSavedWords);

export default router;