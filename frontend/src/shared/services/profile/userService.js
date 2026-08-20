import { supabase } from '../../api/supabase';
import { endpoints } from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getValidSession } from '../authService';
import { parseJsonResponse } from '../../utils/apiUtils';

export const getAuthSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const getUserRoleAndMode = async () => {
  const [role, guestMode] = await Promise.all([
    AsyncStorage.getItem('@user_role'),
    AsyncStorage.getItem('@guest_mode'),
  ]);
  return { role, guestMode };
};

export const clearAuthSession = async () => {
  await AsyncStorage.multiRemove(['@user_token', '@user_role', '@user_metadata', '@guest_mode']);
};

export const fetchUserProfileData = async (accessToken) => {
  const response = await fetch(endpoints.USER_PROFILE, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

export const fetchUserStreakData = async (accessToken) => {
  const response = await fetch(endpoints.USER_STREAK, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

export const fetchUserProfile = async () => {
  try {
    const session = await getValidSession();
    const response = await fetch(endpoints.USER_PROFILE, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await parseJsonResponse(response);
    if (result.success) return result.data;
    return null;
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return null;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const session = await getValidSession();
    const response = await fetch(endpoints.USER_PROFILE, {
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
