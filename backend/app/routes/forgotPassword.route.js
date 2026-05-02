// routes/auth.routes.js
import express from 'express';
import { 
  sendPasswordResetOTP, 
  verifyResetOTP, 
  updatePassword 
} from '../controllers/forgotPassword.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Step 1: Request OTP
router.post('/forgot-password', sendPasswordResetOTP);

// Step 2: Verify OTP (Returns token)
router.post('/verify-otp', verifyResetOTP);

// Step 3: Update Password (Requires token from Step 2)
router.post('/update-password', verifyToken, updatePassword);

export default router;