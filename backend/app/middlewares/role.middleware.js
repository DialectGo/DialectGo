import { supabaseAdmin } from '../config/db.js';

export const authorizeRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // Guest check — works for both JWT and Supabase users
      if (req.user?.user_metadata?.role === 'guest' && requiredRole !== 'guest') {
        return res.status(403).json({
          success: false,
          status: 403,
          message: 'Restricted Feature: Please sign up or log in to unlock full translation tracking and streaks.',
        });
      }

      // ── Strategy 1: JWT users already have role in token ──────────────────
      // auth.middleware.js sets req.user.role when verifying a custom JWT
      if (req.user?.role && req.user.role !== 'authenticated' && req.user.role !== 'anon') {
        if (req.user.role !== requiredRole) {
          return res.status(403).json({
            success: false,
            status: 403,
            message: `Access denied: Requires ${requiredRole} role`,
          });
        }
        return next();
      }

      // ── Strategy 2: Supabase users — look up role from profiles table ─────
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({
          success: false,
          status: 403,
          message: 'Access denied: Could not verify user role',
        });
      }

      if (profile.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          status: 403,
          message: `Access denied: Requires ${requiredRole} role`,
        });
      }

      req.user.role = profile.role;
      next();

    } catch (err) {
      next(err);
    }
  };
};