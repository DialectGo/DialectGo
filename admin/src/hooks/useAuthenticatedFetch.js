// hooks/useAuthenticatedFetch.js
import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Helper: Decode JWT to check expiration
const getTokenExpiration = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    return payload.exp ? payload.exp * 1000 : null;
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};

const isTokenExpired = (token, bufferMs = 60000) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  const now = Date.now();
  return (expiration - now) < bufferMs;
};

export const useAuthenticatedFetch = () => {
  const authenticatedFetch = useCallback(async (url, options = {}) => {
    // Step 1: Get current session
    let { data: { session }, error } = await supabase.auth.getSession();

    // Step 2: Check if token needs refresh
    if (error || !session) {
      console.log('No session, attempting refresh...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Token refresh failed:', refreshError?.message);
        window.location.href = '/login';
        throw new Error('Session expired - please login again');
      }
      
      session = refreshData.session;
    } else if (isTokenExpired(session.access_token)) {
      console.log('Token expiring soon, refreshing...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Token refresh failed:', refreshError?.message);
        window.location.href = '/login';
        throw new Error('Session expired - please login again');
      }
      
      session = refreshData.session;
    }

    // Step 3: Make the API call
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 4: Handle 401 responses
    if (response.status === 401) {
      console.error('Received 401, forcing re-login');
      await supabase.auth.signOut();
      window.location.href = '/login';
      throw new Error('Unauthorized - please login again');
    }

    return response;
  }, []);

  return authenticatedFetch;
};
