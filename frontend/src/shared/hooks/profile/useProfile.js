import { useProfileContext } from '../../context/ProfileContext';
import { useProfileAuth } from './useProfileAuth';

export const useProfile = (onNavigate, router) => {
  const { 
    loading, 
    refreshing, 
    isGuest, 
    isConnected,
    refreshProfile,
    firstName, 
    lastName, 
    userAvatar, 
    streakCount 
  } = useProfileContext();

  const { gateVisible, setGateVisible, handleProtectedAction, handleLogout } = useProfileAuth(isGuest, isConnected, onNavigate, router);

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
    handleRefresh: refreshProfile,
    handleProtectedAction,
    handleLogout
  };
};
