import express from 'express';
import { 
    startSession, 
    completeSession 
} from '../controllers/sessionController.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { validateSessionStart, validateSessionComplete } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Protected routes
router.post('/start', verifyToken, validateSessionStart, startSession);
router.post('/:session_id/complete', verifyToken, validateSessionComplete, completeSession);

export default router;