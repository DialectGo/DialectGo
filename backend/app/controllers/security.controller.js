import { supabase, supabaseAdmin } from '../config/db.js';

export const getSecurityMetricsOverview = async (
  req,
  res,
  next
) => {

  try {

    // =========================================
    // SYSTEM ANOMALIES
    // =========================================

    const {
      data: anomalies,
      error: anomalyError
    } = await supabaseAdmin
      .from('security_anomalies')
      .select('*')
      .order('created_at', {
        ascending: false
      });

    if (anomalyError)
      throw anomalyError;

    // =========================================
    // ADMIN ACTIVITY LOGS
    // =========================================

    const {
      data: activityLogs,
      error: logsError
    } = await supabaseAdmin
      .from('admin_activity_logs')
      .select(`
        id,
        operation_type,
        target_table,
        status,
        created_at,
        maker_id
      `)
      .order('created_at', {
        ascending: false
      })
      .limit(10);

    if (logsError)
      throw logsError;

    // =========================================
    // ACTIVE ADMIN SESSIONS
    // =========================================

    const {
      data: activeSessions,
      error: sessionsError
    } = await supabaseAdmin
      .from('active_admin_sessions')
      .select(`
        id,
        admin_id,
        country_code,
        city_name,
        login_at,
        last_seen_at
      `)
      .eq('is_active', true)
      .is('logout_at', null)
      .order('last_seen_at', {
        ascending: false
      });

    if (sessionsError)
      throw sessionsError;

    // =========================================
    // PROFILE LOOKUP
    // =========================================

    const makerIds = [
      ...new Set([
        ...(activityLogs || []).map(
          log => log.maker_id
        ),
        ...(activeSessions || []).map(
          session => session.admin_id
        )
      ].filter(Boolean))
    ];

    const {
      data: profiles,
      error: profileError
    } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        username
      `)
      .in('id', makerIds);

    if (profileError)
      throw profileError;

    const profileMap =
      new Map(
        (profiles || []).map(
          profile => [
            profile.id,
            profile
          ]
        )
      );

    // =========================================
    // ENRICH ACTIVITY LOGS
    // =========================================

    const enrichedLogs =
      (activityLogs || []).map(log => {

        const profile =
          profileMap.get(log.maker_id);

        const session =
          (activeSessions || []).find(
            s => s.admin_id === log.maker_id
          );

        return {
          ...log,

          admin_name:
            profile?.username ||
            `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
            'Unknown Admin',

          city_name:
            session?.city_name || 'Unknown',

          country_code:
            session?.country_code || 'N/A'
        };
      });

    // =========================================
    // COUNTS
    // =========================================

    const unresolvedAnomalies =
      anomalies.filter(
        item => !item.is_resolved
      ).length;

    const monitoredActions =
      new Set(
        enrichedLogs.map(
          item => item.operation_type
        )
      ).size;

    const currentActiveAdmins =
      new Set(
        (activeSessions || [])
          .map(session => session.admin_id)
          .filter(Boolean)
      ).size;

    // =========================================
    // RESPONSE
    // =========================================

    res.json({
      success: true,
      data: {

        anomalies,

        recentLogs:
          enrichedLogs,

        activeAdmins:
          activeSessions,

        totalAnomalies:
          anomalies.length,

        unresolvedAnomalies,

        operationalAuditLogCount:
          activityLogs.length,

        monitoredActionsCount:
          monitoredActions,

        currentActiveAdmins
      }
    });

  } catch (err) {

    console.error(
      'Security metrics failure:',
      err
    );

    next(err);
  }
};

export const getActiveAdmins = async (
  req,
  res,
  next
) => {

  try {

    const {
      data: sessions,
      error
    } = await supabaseAdmin
      .from('active_admin_sessions')
      .select(`
        id,
        admin_id,
        ip_address,
        user_agent,
        country_code,
        city_name,
        login_at,
        last_seen_at
      `)
      .eq('is_active', true)
      .is('logout_at', null)
      .order('last_seen_at', {
        ascending: false
      });

    if (error)
      throw error;

    const adminIds = [
      ...new Set(
        (sessions || [])
          .map(
            item => item.admin_id
          )
          .filter(Boolean)
      )
    ];

    const {
      data: profiles
    } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        username,
        first_name,
        last_name
      `)
      .in('id', adminIds);

    const profileMap =
      new Map(
        (profiles || []).map(
          profile => [
            profile.id,
            profile
          ]
        )
      );

    const formatted =
      (sessions || []).map(session => {

        const profile =
          profileMap.get(
            session.admin_id
          );

        return {

          ...session,

          username:
            profile?.username ||
            `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
            'Administrator'
        };
      });

    res.json({
      success: true,
      data: formatted
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