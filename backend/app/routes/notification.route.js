import express from 'express';
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead
} from '../controllers/notification.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getUserNotifications);
router.put('/read-all', verifyToken, markAllAsRead);
router.put('/:id/read', verifyToken, markAsRead);

export default router;
