// admin-frontend/src/services/uam.service.js
// import { supabaseAdmin } from '../config/db';

export const fetchAuditLogs = async () => {
  const { data, error } = await supabaseAdmin
    .from('audit_logs')
    .select(`
      *,
      profiles:actor_id (username, first_name, last_name)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};