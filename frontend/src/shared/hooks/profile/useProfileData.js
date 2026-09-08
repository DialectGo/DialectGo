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

  const fetchUserProfile = useCallback(async (accessToken) => {
    try {
      const result = await fetchUserProfileData(accessToken);
      if (result.success) {
        const user = result.data;
        setFirstName(user.first_name || 'User');
        setLastName(user.last_name || '');
        
        if (user.profile_avatar_url) {
          const matched = availableAvatars.find(a => a.name === user.profile_avatar_url);
          if (matched) setUserAvatar(matched.source);
        }

        // Save to dedicated current user cache for instant hydration on app reload
        AsyncStorage.setItem('dialectgo_current_user_cache', JSON.stringify({
          first_name: user.first_name,
          last_name: user.last_name,
          avatar_url: user.profile_avatar_url
        })).catch(() => {});
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
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
