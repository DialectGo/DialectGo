import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Unified auth middleware.
 * Accepts both:
 * 1. JWT tokens (issued by our /api/auth/login — used by admin panel)
 * 2. Supabase tokens (used by mobile/frontend app)
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }

    //Try verifying as our JWT first 
    if (JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Normalize to the same shape as Supabase's req.user
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        };

        return next();
      } catch (jwtErr) {
        // Not a valid JWT — fall through to Supabase check
        if (jwtErr.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized: Token expired',
          });
        }
        // Any other JWT error = not our token, try Supabase next
      }
    }

    // Fall back to Supabase token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or expired token',
      });
    }

    req.user = user;
    req.token = token;
    next();

  } catch (err) {
    next(err);
  }
};

export default verifyToken;