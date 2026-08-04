import { supabaseAdmin } from '../config/db.js';

export const NotificationModel = {
    /**
     * Get all notifications for a specific user, sorted by newest first.
     */
    getUserNotifications: async (userId, limit = 50) => {
        const { data, error } = await supabaseAdmin
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
    markAsRead: async (notificationId, userId) => {
        const { error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('user_id', userId);

        return { error };
    },

    /**
     * Mark all notifications for a user as read.
     */
    markAllAsRead: async (userId) => {
        const { error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        return { error };
    }
};
