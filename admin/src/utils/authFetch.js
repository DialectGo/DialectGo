// utils/authFetch.js
import { supabase } from '../lib/supabase';

// Define your backend base engine address
const API_BASE_URL = 'http://192.168.1.53:5001';

export const authFetch = async (url, options = {}) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.warn('No valid administrative session found, redirecting...');
      window.location.href = '/login';
      throw new Error('Session expired - please login again');
    }

    // 🔥 Prepend the API_BASE_URL to the target request string
    const targetUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    return await fetch(targetUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${session.access_token}`,
      }
    });

  } catch (err) {
    console.error('Security fetch boundary failure:', err.message);
    throw err;
  }
};