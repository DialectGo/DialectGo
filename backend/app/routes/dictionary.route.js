import express from 'express';
import { 
    getWordDefinition,
    getBrowseWords,
    saveWord, 
    checkSavedStatus,
    getSavedWords ,
    deleteSelectedWords,
    getSearchHistory,
    deleteSelectedHistory,
    getWordOfTheDay
} from '../controllers/dictionary.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { validateDictionarySave } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Public routes
router.get('/search/:term', verifyToken, getWordDefinition);
router.get('/browse', verifyToken, getBrowseWords);

// Protected routes
router.post('/save', verifyToken, validateDictionarySave, saveWord);
router.get('/check-saved/:id', verifyToken, checkSavedStatus);
router.get('/saved', verifyToken, getSavedWords);
router.delete('/delete-multiple', verifyToken, deleteSelectedWords);
router.get('/history', verifyToken, getSearchHistory);
router.delete('/history/delete-multiple', verifyToken, deleteSelectedHistory);
router.get('/word-of-the-day', verifyToken, getWordOfTheDay);

export default router;