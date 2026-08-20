import { endpoints } from '../api/client';
import { getValidSession } from './authService';
import { parseJsonResponse } from '../utils/apiUtils';

const PROFILE_API = endpoints.USER_PROFILE;

/**
 * Fetches the current user's profile data.
 * 
 * @returns {Promise<Object>} The user profile data, or null on failure
 */
export const fetchUserProfile = async () => {
  try {
    const session = await getValidSession();

    const response = await fetch(PROFILE_API, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await parseJsonResponse(response);
    if (result.success) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return null;
  }
};

/**
 * Updates the current user's profile data.
 *
 * @param {Object} profileData - Fields to update: { firstName, lastName, birthDate, country, province, city, profile_avatar_url }
 * @returns {Promise<boolean>} true on success, false on failure
 */
export const updateUserProfile = async (profileData) => {
  try {
    const session = await getValidSession();

    const response = await fetch(PROFILE_API, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    return response.ok;
  } catch (error) {
    console.error("Profile Update Error:", error);
    return false;
  }
};

