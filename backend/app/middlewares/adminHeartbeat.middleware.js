import { supabaseAdmin } from '../config/db.js';

export const updateAdminHeartbeat = async (req, res, next) => {

  if (req.user?.role !== 'admin') {
    return next();
  }

  await supabaseAdmin
    .from('profiles')
    .update({
      last_active_at: new Date().toISOString()
    })
    .eq('id', req.user.id);

  next();
};