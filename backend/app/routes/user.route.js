import express from 'express';
import * as UserController from '../controllers/user.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.middleware.js';
import { registerSchema, loginSchema } from '../validators/user.validator.js';

const router = express.Router();

// PUBLIC
router.post('/register', validate(registerSchema), UserController.register);
router.post('/login', loginLimiter, validate(loginSchema), UserController.login);
router.post('/guest-login', loginLimiter, UserController.loginGuest);

// USER
router.get('/profile', verifyToken, UserController.getProfile);
router.put('/profile', verifyToken, UserController.updateProfile);
router.get('/streak', verifyToken, UserController.getStreakData);
// ADMIN
router.get('/admin/users', verifyToken, authorizeRole('admin'), UserController.getAllUsers);

export default router;