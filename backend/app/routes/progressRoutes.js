import express from 'express';
import { 
    getUserProgress, 
    updateProgress,
    getLeaderboard,
    getOwnProgress,
    getProgressBySession
} from '../controller/progressController.js';
import verifyToken from '../middlewares/auth.js';
import { validateProgressUpdate, validateUserIdParam, validateSessionIdParam } from '../middlewares/requestValidator.js';

const router = express.Router();

// Protected routes
router.get('/me', verifyToken, getOwnProgress);
router.get('/session/:session_id', verifyToken, validateSessionIdParam, getProgressBySession);
router.get('/:user_id', verifyToken, validateUserIdParam, getUserProgress);
router.patch('/update', verifyToken, validateProgressUpdate, updateProgress);
router.get('/leaderboard/top', verifyToken, getLeaderboard);

export default router;