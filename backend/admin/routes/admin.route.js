/**
 * Admin Routes (admin/routes/admin.route.js)
 *
 * All routes require verifyToken + authorizeRole('admin').
 * This router handles both existing admin operations and the new
 * Hallucination Analytics endpoints.
 */

import express from 'express';
import verifyToken from '../../app/middlewares/auth.middleware.js';
import { authorizeRole } from '../../app/middlewares/role.middleware.js';
import * as AdminController from '../controllers/admin.controller.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(verifyToken, authorizeRole('admin'));

// ─── Dashboard ─────────────────────────────────────────────────────────────
router.get('/dashboard', AdminController.getDashboardStats);

// ─── Users ─────────────────────────────────────────────────────────────────
router.get('/users',               AdminController.getUsers);
router.put('/users/:id/role',      AdminController.updateUserRole);
router.put('/users/:id/toggle',    AdminController.toggleUserDisabled);

// ─── Dictionary ────────────────────────────────────────────────────────────
router.get('/dictionary',          AdminController.getDictionary);
router.post('/dictionary',         AdminController.addDictionaryEntry);
router.put('/dictionary/:id',      AdminController.updateDictionaryEntry);
router.delete('/dictionary/:id',   AdminController.deleteDictionaryEntry);

// ─── Translation Recommendations ───────────────────────────────────────────
router.get('/translations',               AdminController.getTranslations);
router.put('/translations/:id/approve',   AdminController.approveTranslation);
router.put('/translations/:id/reject',    AdminController.rejectTranslation);

// ─── Wiki Submissions ──────────────────────────────────────────────────────
router.get('/wiki',               AdminController.getWikiSubmissions);
router.put('/wiki/:id/verify',    AdminController.verifySubmission);
router.put('/wiki/:id/reject',    AdminController.rejectSubmission);

// ─── Dialect Corpus ────────────────────────────────────────────────────────
router.get('/corpus',             AdminController.getCorpus);
router.delete('/corpus/:id',      AdminController.deleteCorpusEntry);

// ─── Notifications ─────────────────────────────────────────────────────────
router.get('/notifications',                 AdminController.getNotifications);
router.put('/notifications/read-all',        AdminController.markAllNotificationsRead);
router.put('/notifications/:id/read',        AdminController.markNotificationRead);
router.delete('/notifications/all',          AdminController.deleteAllNotifications);
router.delete('/notifications/:id',          AdminController.deleteNotification);

// ─── Analytics: Hallucination & Feedback ───────────────────────────────────
// GET /api/admin/analytics/feedback-trends?days=30
router.get('/analytics/feedback-trends',     AdminController.getFeedbackTrends);

// GET /api/admin/analytics/hallucination-flags?days=30
router.get('/analytics/hallucination-flags', AdminController.getHallucinationFlags);

// GET /api/admin/analytics/stats
router.get('/analytics/stats',               AdminController.getAnalyticsStats);

// GET /api/admin/analytics/prescriptions
router.get('/analytics/prescriptions',       AdminController.getPrescriptions);

// GET /api/admin/analytics/export-dataset?days=90&minNegative=1
router.get('/analytics/export-dataset',      AdminController.exportFineTuningDataset);

export default router;
