import jwt from 'jsonwebtoken';
import { adminLogin } from '../services/user.service.js';

/**
 * POST /api/auth/login
 * Authenticates an admin using Supabase + issues a JWT for subsequent requests.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Uses your existing adminLogin — handles Supabase auth, geo, device
    // fingerprinting, impossible travel detection, and session recording
    const result = await adminLogin(email, password, req);

    // Issue a JWT for the admin frontend to use on subsequent requests
    const token = jwt.sign(
      {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.status(200).json({
      success: true,
      token,
      admin: result.user,
    });

  } catch (err) {
    // adminLogin throws 'Access Denied' for non-admins
    if (err.message === 'Access Denied') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.',
      });
    }

    // Supabase throws for invalid credentials
    if (
      err.message?.toLowerCase().includes('invalid') ||
      err.message?.toLowerCase().includes('credentials') ||
      err.message?.toLowerCase().includes('password')
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    next(err);
  }
}