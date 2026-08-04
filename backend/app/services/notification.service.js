import { NotificationModel } from '../models/notification.model.js';
import { supabaseAdmin } from '../config/db.js';

export const notifyAllAdmins = async ({ type, title, message, metadata = {} }) => {
  const { data: admins } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('role', 'admin');

  if (!admins?.length) return;

  const payload = admins.map(admin => ({
    recipient_id: admin.id,
    type,
    title,
    message,
    metadata
  }));

  await supabaseAdmin
    .from('admin_notifications')
    .insert(payload);
};

export const NotificationService = {
    getUserNotifications: async (userId) => {
        return await NotificationModel.getUserNotifications(userId);
    },

    markAsRead: async (notificationId, userId) => {
        return await NotificationModel.markAsRead(notificationId, userId);
    },

    markAllAsRead: async (userId) => {
        return await NotificationModel.markAllAsRead(userId);
    }
};