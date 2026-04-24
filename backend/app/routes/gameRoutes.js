import express from 'express';
import { 
    getAllGames, 
    getGameChallenges 
} from '../controller/gameController.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router();

// Protected routes
router.get('/', verifyToken, getAllGames);
router.get('/:id/challenges', verifyToken, getGameChallenges);

export default router;