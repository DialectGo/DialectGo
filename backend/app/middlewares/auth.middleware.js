// middlewares/auth.middleware.js
import { supabaseAdmin } from '../config/db.js';

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Use getUser(token) to verify the JWT against your Supabase project
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  req.user = user;
  next();
};

export default verifyToken;