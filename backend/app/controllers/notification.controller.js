import { NotificationService } from '../services/notification.service.js';

/**
 * GET /api/notifications
 * Fetch user notifications.
 */
export const getUserNotifications = async (req, res, next) => {
    try {
        const { data, error } = await NotificationService.getUserNotifications(req.user.id);
        
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a specific notification as read.
 */
export const markAsRead = async (req, res, next) => {
    try {
        const { error } = await NotificationService.markAsRead(req.params.id, req.user.id);
        
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        
        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/notifications/read-all
 * Mark all user notifications as read.
 */
export const markAllAsRead = async (req, res, next) => {
    try {
        const { error } = await NotificationService.markAllAsRead(req.user.id);
        
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        
        res.status(200).json({ success: true, message: 'All marked as read' });
    } catch (err) {
        next(err);
    }
};
