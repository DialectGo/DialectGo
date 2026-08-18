import { endpoints } from '../api/client';
import { getValidSession } from './authService';
import { parseJsonResponse } from '../utils/apiUtils';

const STREAK_API = endpoints.USER_STREAK;

/**
 * Fetches the user's current streak data.
 * 
 * @returns {Promise<Object>} The streak data, or null on failure
 */
export const fetchStreak = async () => {
  try {
    const session = await getValidSession();

    const response = await fetch(STREAK_API, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    const result = await parseJsonResponse(response);
    if (result.success) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("Streak Fetch Error:", error);
    return null;
  }
};
