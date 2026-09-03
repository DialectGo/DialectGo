import express from 'express';
import * as UserController from '../controllers/user.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.middleware.js';
import { registerSchema, loginSchema } from '../validators/user.validator.js';

const router = express.Router();

// PUBLIC
router.post('/register', validate(registerSchema), UserController.register);
router.post('/login', loginLimiter, validate(loginSchema), UserController.login);
router.post('/guest-login', loginLimiter, UserController.loginGuest);

// USER
router.get('/profile', verifyToken, UserController.getProfile);
router.put('/profile', verifyToken, UserController.updateProfile);
router.get('/streak', verifyToken, UserController.getStreakData);

// DEVICE PROFILES (multi-account auth screen)
router.post('/device-profiles', verifyToken, UserController.saveDeviceProfile);
router.get('/device-profiles/:deviceId', UserController.getDeviceProfiles);          // Public (pre-login)
router.delete('/device-profiles/:deviceId/:userId', UserController.removeDeviceProfile); // Public (pre-login removal)

// ADMIN
router.get('/admin/users', verifyToken, authorizeRole('admin'), UserController.getAllUsers);
router.post('/admin/login', loginLimiter, validate(loginSchema), UserController.adminLogin);

router.get('/admin/users', verifyToken, authorizeRole('admin'), UserController.getAllUsers);
// New Endpoint for aggregate analytics hydration
router.get('/admin/metrics', verifyToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { supabaseAdmin } = await import('../config/db.js');
    
    // Safely query target metrics vectors from your profiles architecture
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('role, is_disabled, last_active_at, preferred_language_code, streak_count');
      
    if (error) {
      console.error("Supabase dynamic metrics error:", error.message);
      throw error;
    }

    const now = new Date();
    const total = profiles?.length || 0;
    let active = 0;
    let disabled = 0;
    let admins = 0;

    const langCounts = {};
    const streaks = { '1-5 Days': 0, '6-10 Days': 0, '11-20 Days': 0, '21-30 Days': 0, '30+ Days': 0 };

    profiles.forEach(p => {
      // Role evaluations
      if (p.role === 'admin') admins++;
      
      // Strict fallback evaluations for is_disabled flag
      if (p.is_disabled === true) {
        disabled++;
      } else {
        // Active status fallback verification: 15-minute verification loop
        const lastActive = p.last_active_at ? new Date(p.last_active_at) : null;
        if (lastActive && (now - lastActive) / (1000 * 60) <= 15) {
          active++;
        } else if (!p.last_active_at) {
          // Fallback backup: count them active if logged in now but timestamp is null
          active++; 
        }
      }

      // Languages Aggregation normalizer
      const lang = p.preferred_language_code || 'en';
      langCounts[lang] = (langCounts[lang] || 0) + 1;

      // Streaks Binning loops
      const s = p.streak_count || 0;
      if (s >= 1 && s <= 5) streaks['1-5 Days']++;
      else if (s >= 6 && s <= 10) streaks['6-10 Days']++;
      else if (s >= 11 && s <= 20) streaks['11-20 Days']++;
      else if (s >= 21 && s <= 30) streaks['21-30 Days']++;
      else if (s > 30) streaks['30+ Days']++;
    });

    // Match your client structure mapping expectations by using standard data nesting envelopes
    res.json({
      success: true,
      data: {
        metrics: { total, active, disabled, admins },
        languages: langCounts,
        streaks
      }
    });
  } catch (err) { 
    next(err); 
  }
});
export default router;