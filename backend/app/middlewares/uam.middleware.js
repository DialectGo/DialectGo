// backend/app/middlewares/uam.middleware.js
import { supabaseAdmin } from '../config/db.js';

export const monitorActivity = (actionType, severity = 'INFO') => {
  return async (req, res, next) => {
    const originalSend = res.send;

    // Intercept response to log only successful or specific failed actions
    res.send = function (data) {
      const logEntry = {
        actor_id: req.user?.id || null,
        action_type: actionType,
        severity: severity,
        entity_name: req.originalUrl,
        ip_address: req.ip || req.headers['x-forwarded-for'],
        details: {
          method: req.method,
          params: req.params,
          status: res.statusCode
        }
      };

      // Sensor Logic: Detect Bulk Activity (Baseline Check)
      if (actionType === 'EXPORT' && res.statusCode === 200) {
        logEntry.severity = 'WARN'; // High volume alerts
      }

      // Async log to Supabase using Admin Key (to bypass RLS)
      supabaseAdmin.from('audit_logs').insert(logEntry).then(() => {});

      originalSend.apply(res, arguments);
    };
    next();
  };
};