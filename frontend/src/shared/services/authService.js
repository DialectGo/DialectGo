import { supabase } from '../api/supabase';

/**
 * Retrieves a valid Supabase session.
 * If the access token is missing or invalid, it automatically attempts to refresh the session.
 * 
 * @returns {Promise<Object>} The valid session object
 * @throws {Error} If authentication has completely expired
 */
export const getValidSession = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData?.session?.access_token) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshData?.session?.access_token) {
      throw new Error('Authentication expired. Please log in again.');
    }
    return refreshData.session;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(sessionData.session.access_token);
  if (userError || !userData?.user) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshData?.session?.access_token) {
      throw new Error('Authentication expired. Please log in again.');
    }
    return refreshData.session;
  }

  return sessionData.session;
};
