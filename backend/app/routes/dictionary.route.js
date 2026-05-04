import express from 'express';
import { 
    getWordDefinition, 
    saveWord, 
    getSavedWords ,
    deleteSelectedWords,
    getSearchHistory,
    deleteSelectedHistory
} from '../controllers/dictionary.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { validateDictionarySave } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Public routes
router.get('/search/:term', verifyToken, getWordDefinition);

// Protected routes
router.post('/save', verifyToken, validateDictionarySave, saveWord);
router.get('/saved', verifyToken, getSavedWords);
router.delete('/delete-multiple', verifyToken, deleteSelectedWords);
router.get('/history', verifyToken, getSearchHistory);
router.delete('/history/delete-multiple', verifyToken, deleteSelectedHistory);

export default router;