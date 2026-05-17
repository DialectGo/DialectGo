import { supabase, supabaseAdmin } from '../config/db.js';

export const getSecurityMetricsOverview = async (req, res, next) => {
    try {
        const { data: anomalies } = await supabaseAdmin
            .from('security_anomalies')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: recentLogs } = await supabaseAdmin
            .from('admin_activity_logs')
            .select('id, action_type, actor_id, country_code, city_name, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        res.json({
            success: true,
            data: { anomalies: anomalies || [], recentLogs: recentLogs || [] }
        });
    } catch (err) {
        next(err);
    }
};

export const resolveAnomaly = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('security_anomalies')
            .update({ is_resolved: true, resolved_by: req.user.id })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};