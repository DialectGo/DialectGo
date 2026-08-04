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
    getUserNotifications: async (token, userId) => {
        return await NotificationModel.getUserNotifications(token, userId, 50);
    },

    markAsRead: async (token, notificationId, userId) => {
        return await NotificationModel.markAsRead(token, notificationId, userId);
    },

    markAllAsRead: async (token, userId) => {
        return await NotificationModel.markAllAsRead(token, userId);
    }
};