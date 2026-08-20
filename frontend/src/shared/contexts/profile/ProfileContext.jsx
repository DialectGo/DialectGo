import React, { createContext, useContext, useEffect, useCallback, useState, useRef } from 'react';
import { useProfileData } from '../../hooks/profile/useProfileData';
import { useProfileNetwork } from '../../hooks/profile/useProfileNetwork';
import { getUserRoleAndMode, getAuthSession } from '../../services/profile/userService';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const hasInitialized = useRef(false);

  const { isConnected } = useProfileNetwork();
  const profileData = useProfileData();

  const loadProfileData = useCallback(async (isManualRefresh = false) => {
    if (!isConnected) {
      setRefreshing(false);
      return; 
    }
    
    if (!hasInitialized.current && !isManualRefresh) {
      setLoading(true);
    }

    try {
      const { role, guestMode } = await getUserRoleAndMode();
      const session = await getAuthSession();

      const guestStatus = role === 'guest' || guestMode !== null || !session || !isConnected;
      setIsGuest(guestStatus);

      if (guestStatus) {
        profileData.resetProfileData();
        return;
      }

      await Promise.all([
        profileData.fetchUserProfile(session.access_token),
        profileData.fetchStreak(session.access_token)
      ]);

    } catch (error) {
      console.log('Profile load error:', error);
      setIsGuest(true);
      profileData.resetProfileData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isConnected, profileData.fetchUserProfile, profileData.fetchStreak, profileData.resetProfileData]);

  useEffect(() => {
    if (!isConnected) {
      setLoading(false); 
      setRefreshing(false);
      setIsGuest(true);
      profileData.resetProfileData();
      return;
    }

    if (!hasInitialized.current) {
      hasInitialized.current = true;
      loadProfileData();
    }
  }, [isConnected, loadProfileData, profileData.resetProfileData]);

  const refreshProfile = () => {
    setRefreshing(true);
    loadProfileData(true);
  };

  return (
    <ProfileContext.Provider value={{
      loading,
      refreshing,
      isGuest,
      isConnected,
      refreshProfile,
      ...profileData
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => useContext(ProfileContext);
