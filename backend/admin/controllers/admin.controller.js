/**
 * Admin Controller (admin/controllers/admin.controller.js)
 *
 * Delegates to AdminService for existing features and
 * to HallucinationAnalyticsService for the new analytics endpoints.
 * This file is the central controller for all admin-only operations.
 */

import { AdminService } from '../../app/services/admin.service.js';
import { HallucinationAnalyticsService } from '../services/hallucinationAnalytics.service.js';

// ─── Dashboard ────────────────────────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await AdminService.getDashboardStats();
        res.json({ success: true, data: stats });
    } catch (err) { next(err); }
};

// ─── Users ────────────────────────────────────────────────────────────────
export const getUsers = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.getAllUsers();
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const updateUserRole = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.updateUserRole(req.params.id, req.body.role);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const toggleUserDisabled = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.toggleUserDisabled(req.params.id, req.body.is_disabled);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

// ─── Dictionary ───────────────────────────────────────────────────────────
export const getDictionary = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { data, error, count } = await AdminService.getDictionaryEntries(page, limit);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data, count });
    } catch (err) { next(err); }
};

export const addDictionaryEntry = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.addDictionaryEntry(req.body);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const updateDictionaryEntry = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.updateDictionaryEntry(req.params.id, req.body);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const deleteDictionaryEntry = async (req, res, next) => {
    try {
        const { error } = await AdminService.deleteDictionaryEntry(req.params.id);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true });
    } catch (err) { next(err); }
};

// ─── Translations (User Recommendations) ─────────────────────────────────
export const getTranslations = async (req, res, next) => {
    try {
        const status = req.query.status || null;
        const { data, error } = await AdminService.getTranslationRecommendations(status);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const approveTranslation = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.approveTranslation(req.params.id);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const rejectTranslation = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.rejectTranslation(req.params.id);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

// ─── Wiki Submissions ─────────────────────────────────────────────────────
export const getWikiSubmissions = async (req, res, next) => {
    try {
        const status = req.query.status || null;
        const { data, error } = await AdminService.getWikiSubmissions(status);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const verifySubmission = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.verifySubmission(req.params.id);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const rejectSubmission = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.rejectSubmission(req.params.id);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

// ─── Dialect Corpus ───────────────────────────────────────────────────────
export const getCorpus = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { data, error, count } = await AdminService.getCorpusEntries(page, limit);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data, count });
    } catch (err) { next(err); }
};

export const deleteCorpusEntry = async (req, res, next) => {
    try {
        const { error } = await AdminService.deleteCorpusEntry(req.params.id);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true });
    } catch (err) { next(err); }
};

// ─── Notifications ────────────────────────────────────────────────────────
export const getNotifications = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.getNotifications(req.user.id);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const markNotificationRead = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.markNotificationRead(req.user.id, req.params.id);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const markAllNotificationsRead = async (req, res, next) => {
    try {
        const { data, error } = await AdminService.markAllNotificationsRead(req.user.id);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const { error } = await AdminService.deleteNotification(req.user.id, req.params.id);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true });
    } catch (err) { next(err); }
};

export const deleteAllNotifications = async (req, res, next) => {
    try {
        const { error } = await AdminService.deleteAllNotifications(req.user.id);
        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true });
    } catch (err) { next(err); }
};

// ─── Analytics: Feedback Trends ───────────────────────────────────────────
export const getFeedbackTrends = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await HallucinationAnalyticsService.getFeedbackTrends(days);
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

// ─── Analytics: Hallucination Flags ──────────────────────────────────────
export const getHallucinationFlags = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await HallucinationAnalyticsService.getHallucinationFlags(days);
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

// ─── Analytics: Stats ─────────────────────────────────────────────────────
export const getAnalyticsStats = async (req, res, next) => {
    try {
        const data = await HallucinationAnalyticsService.getAnalyticsStats();
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

// ─── Analytics: Prescriptions ─────────────────────────────────────────────
export const getPrescriptions = async (req, res, next) => {
    try {
        const data = await HallucinationAnalyticsService.getPrescriptions();
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

// ─── Analytics: Export Fine-Tuning Dataset ────────────────────────────────
export const exportFineTuningDataset = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 90;
        const minNeg = parseInt(req.query.minNegative) || 1;
        const data = await HallucinationAnalyticsService.exportFineTuningDataset(days, minNeg);
        res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
};
