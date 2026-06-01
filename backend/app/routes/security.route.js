import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';
import * as SecurityController from '../controllers/security.controller.js';
import * as DatasetService from '../services/dataset.service.js';
import * as PromptService from '../services/prompt.service.js';
import * as ModerationService from '../services/moderation.service.js';
import { logAdminActivity } from '../middlewares/activityLogger.middleware.js';

const router = express.Router();

// Base Security Monitoring Endpoint
router.get('/dashboard/security', verifyToken, authorizeRole('admin'), SecurityController.getSecurityMetricsOverview);
router.get('/dashboard/active-admins', verifyToken, authorizeRole('admin'), SecurityController.getActiveAdmins);
router.put('/dashboard/anomaly/:id/resolve', verifyToken, authorizeRole('admin'), SecurityController.resolveAnomaly);

// High Risk Route 1: Dataset Export
router.get('/dataset/export/:langId', verifyToken, authorizeRole('admin'), logAdminActivity('BULK_DATA_EXPORT', () => 'dictionary_entries'), async (req, res, next) => {
    try {
        const fileData = await DatasetService.exportLinguisticDataset(req.user.id, req.params.langId);
        res.json({ success: true, data: fileData });
    } catch (err) { next(err); }
});

// High Risk Route 2: System Prompt Modification Proposal
router.post('/prompt/update', verifyToken, authorizeRole('admin'), logAdminActivity('PROPOSE_PROMPT_UPDATE', () => 'dictionary_entries'), async (req, res, next) => {
    try {
        const reviewJob = await PromptService.proposePromptUpdate(req.user.id, req.body);
        res.json({ success: true, data: reviewJob });
    } catch (err) { next(err); }
});

// Dual Authorization Verification Engine Evaluation Execution
router.put('/prompt/authorize/:authId', verifyToken, authorizeRole('admin'), logAdminActivity('EVALUATE_DUAL_AUTH'), async (req, res, next) => {
    try {
        const resolution = await PromptService.evaluateDualAuthorization(req.user.id, req.params.authId, req.body.status, req.body.rejection_reason);
        res.json({ success: true, data: resolution });
    } catch (err) { next(err); }
});

// High Risk Route 3: Moderation Approvals
router.put('/moderation/approve/:recId', verifyToken, authorizeRole('admin'), logAdminActivity('TRANSLATION_APPROVAL', () => 'user_recommended_translations'), async (req, res, next) => {
    try {
        const approvedItem = await ModerationService.processTranslationApproval(req.user.id, req.params.recId, req.body.status);
        res.json({ success: true, data: approvedItem });
    } catch (err) { next(err); }
});

export default router;