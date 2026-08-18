import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';
import * as AdminController from '../controllers/admin.controller.js';

const router = express.Router();

// All routes below require admin authentication
router.use(verifyToken, authorizeRole('admin'));

// Dashboard
router.get('/dashboard', AdminController.getDashboardStats);

// Users
router.get('/users', AdminController.getUsers);
router.put('/users/:id/role', AdminController.updateUserRole);
router.put('/users/:id/toggle', AdminController.toggleUserDisabled);

// Dictionary
router.get('/dictionary', AdminController.getDictionary);
router.post('/dictionary', AdminController.addDictionaryEntry);
router.put('/dictionary/:id', AdminController.updateDictionaryEntry);
router.delete('/dictionary/:id', AdminController.deleteDictionaryEntry);

// Translations (User Recommendations)
router.get('/translations', AdminController.getTranslations);
router.put('/translations/:id/approve', AdminController.approveTranslation);
router.put('/translations/:id/reject', AdminController.rejectTranslation);

// Wiki Submissions
router.get('/wiki', AdminController.getWikiSubmissions);
router.put('/wiki/:id/verify', AdminController.verifySubmission);
router.put('/wiki/:id/reject', AdminController.rejectSubmission);

// Dialect Corpus
router.get('/corpus', AdminController.getCorpus);
router.delete('/corpus/:id', AdminController.deleteCorpusEntry);

// Admin Notifications
router.get('/notifications', AdminController.getNotifications);
router.put('/notifications/read-all', AdminController.markAllNotificationsRead);
router.put('/notifications/:id/read', AdminController.markNotificationRead);
router.delete('/notifications/all', AdminController.deleteAllNotifications);
router.delete('/notifications/:id', AdminController.deleteNotification);

export default router;
