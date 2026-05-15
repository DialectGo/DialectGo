import { supabase, supabaseAdmin } from '../config/db.js';

export const authorizeRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            // Drop explicit errors if a guest touches internal operations
            if (req.user?.user_metadata?.role === 'guest' && requiredRole !== 'guest') {
                return res.status(403).json({
                    success: false,
                    status: 403,
                    message: "Restricted Feature: Please sign up or log in to unlock full translation tracking and streaks."
                });
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', req.user.id)
                .single();

            if (error || !profile) {
                return res.status(403).json({ 
                    status: 403, 
                    message: "Access denied: Could not verify user role" 
                });
            }

            if (profile.role !== requiredRole) {
                return res.status(403).json({ 
                    status: 403, 
                    message: `Access denied: Requires ${requiredRole} role` 
                });
            }

            req.user.role = profile.role;
            next();
        } catch (err) {
            next(err);
        }
    };
};