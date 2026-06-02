import express from 'express';
import { 
    getUserProgress, 
    updateProgress,
    getLeaderboard,
    getOwnProgress,
    getProgressBySession,
    buyHearts, // ✅ Import the new controller action
    loseHeart
} from '../controllers/progress.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { validateProgressUpdate, validateUserIdParam, validateSessionIdParam } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Protected routes
router.get('/me', verifyToken, getOwnProgress);
router.get('/session/:session_id', verifyToken, validateSessionIdParam, getProgressBySession);
router.patch('/buy-hearts', verifyToken, buyHearts); // ✅ Added dedicated shop endpoint handler
router.patch('/lose-heart', verifyToken, loseHeart);
router.get('/leaderboard/top', verifyToken, getLeaderboard);
router.get('/:user_id', verifyToken, validateUserIdParam, getUserProgress);
router.patch('/update', verifyToken, validateProgressUpdate, updateProgress);

export default router;