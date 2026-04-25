import { supabase, supabaseAdmin } from '../config/db.js';

export const authorizeRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            // Fetch the user's profile to check their role
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

            // Attach role to req.user for easier access later
            req.user.role = profile.role;
            next();
        } catch (err) {
            next(err);
        }
    };
};