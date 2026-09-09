import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfileData, fetchUserStreakData } from '../../services/profile/userService';
import { availableAvatars } from './constants';

export const useProfileData = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userAvatar, setUserAvatar] = useState(availableAvatars[0].source);
  const [streakCount, setStreakCount] = useState(0);
  const [activeDays, setActiveDays] = useState([]);

  const resetProfileData = useCallback(() => {
    setFirstName('Guest');
    setLastName('User');
    setStreakCount(0);
    setActiveDays([]);
    setUserAvatar(availableAvatars[0].source);
  }, []);

  const hydrateProfileData = useCallback((profile) => {
    if (profile.first_name) setFirstName(profile.first_name);
    if (profile.last_name) setLastName(profile.last_name);
    if (profile.avatar_url) {
      const matched = availableAvatars.find(a => a.name === profile.avatar_url);
      if (matched) setUserAvatar(matched.source);
    }
  }, []);

  const fetchUserProfile = useCallback(async (session) => {
    try {
      const accessToken = session?.access_token;
      if (!accessToken) return;
      
      const result = await fetchUserProfileData(accessToken);
      
      let fName = '';
      let lName = '';
      let avatar = null;

      if (result && result.success && result.data) {
        fName = result.data.first_name || '';
        lName = result.data.last_name || '';
        avatar = result.data.profile_avatar_url;
      }

      // Fallback to Google Auth Metadata if backend profile is missing/incomplete
      const metadata = session.user?.user_metadata || {};
      const identityData = session.user?.identities?.[0]?.identity_data || {};
      const fallbackName = metadata.full_name || metadata.name || identityData.full_name || identityData.name;

      if (!fName && fallbackName) {
        const nameParts = fallbackName.split(' ');
        fName = nameParts[0];
        lName = nameParts.slice(1).join(' ');
      }
      
      // If still empty after fallback, default to User
      if (!fName) {
         fName = 'User';
      }

      setFirstName(fName);
      setLastName(lName);
      
      if (avatar) {
        const matched = availableAvatars.find(a => a.name === avatar);
        if (matched) setUserAvatar(matched.source);
      }

      // Save to dedicated current user cache for instant hydration on app reload
      AsyncStorage.setItem('dialectgo_current_user_cache', JSON.stringify({
        first_name: fName,
        last_name: lName,
        avatar_url: avatar
      })).catch(() => {});
      
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      
      // Emergency fallback to Google Auth Metadata on complete crash
      const metadata = session?.user?.user_metadata || {};
      const identityData = session?.user?.identities?.[0]?.identity_data || {};
      const fallbackName = metadata.full_name || metadata.name || identityData.full_name || identityData.name;

      if (fallbackName) {
        const nameParts = fallbackName.split(' ');
        setFirstName(nameParts[0]);
        setLastName(nameParts.slice(1).join(' '));
      } else {
        // If absolutely no name could be found
        setFirstName('User');
      }
    }
  }, []);

  const fetchStreak = useCallback(async (accessToken) => {
    try {
      const result = await fetchUserStreakData(accessToken);
      if (result.success) {
        setStreakCount(result.data.streak);
        setActiveDays(result.data.activeDays || []);
      }
    } catch (error) {
      console.error("Profile Streak Fetch Error:", error);
    }
  }, []);

  return {
    firstName, lastName, userAvatar, streakCount, activeDays,
    fetchUserProfile, fetchStreak, resetProfileData, hydrateProfileData
  };
};
