import { getAuthClient } from '../config/db.js';

export const NotificationModel = {
    /**
     * Get all notifications for a specific user, sorted by newest first.
     */
    getUserNotifications: async (token, userId, limit = 50) => {
        const client = getAuthClient(token);
        const { data, error } = await client
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        return { data: data || [], error };
    },

    /**
     * Mark a specific notification as read.
     */
    markAsRead: async (token, notificationId, userId) => {
        const client = getAuthClient(token);
        const { error } = await client
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('user_id', userId);

        return { error };
    },

    /**
     * Mark all notifications for a user as read.
     */
    markAllAsRead: async (token, userId) => {
        const client = getAuthClient(token);
        const { error } = await client
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        return { error };
    }
};
