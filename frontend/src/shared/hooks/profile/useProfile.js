import { useState, useEffect, useRef, useCallback } from 'react';
import { getUserRoleAndMode, getAuthSession } from '../../services/profile/profileService';
import { useProfileData } from './useProfileData';
import { useProfileNetwork } from './useProfileNetwork';
import { useProfileAuth } from './useProfileAuth';

export const useProfile = (onNavigate, router) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const hasInitialized = useRef(false);

  const { isConnected } = useProfileNetwork();
  const { gateVisible, setGateVisible, handleProtectedAction, handleLogout } = useProfileAuth(isGuest, isConnected, onNavigate, router);
  const { 
    firstName, lastName, userAvatar, streakCount, 
    fetchUserProfile, fetchStreak, resetProfileData 
  } = useProfileData();

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
        resetProfileData();
        return;
      }

      await Promise.all([
        fetchUserProfile(session.access_token),
        fetchStreak(session.access_token)
      ]);

    } catch (error) {
      console.log('Profile load error:', error);
      setIsGuest(true);
      resetProfileData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isConnected, fetchUserProfile, fetchStreak, resetProfileData]);

  useEffect(() => {
    if (!isConnected) {
      setLoading(false); 
      setRefreshing(false);
      setIsGuest(true);
      resetProfileData();
      return;
    }

    if (!hasInitialized.current) {
      hasInitialized.current = true;
      loadProfileData();
    }
  }, [isConnected, loadProfileData, resetProfileData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfileData(true);
  };

  return {
    loading,
    refreshing,
    isGuest,
    gateVisible,
    setGateVisible,
    firstName,
    lastName,
    userAvatar,
    streakCount,
    handleRefresh,
    handleProtectedAction,
    handleLogout
  };
};
