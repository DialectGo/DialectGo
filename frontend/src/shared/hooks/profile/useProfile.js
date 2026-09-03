import { useProfileContext } from '../../context/ProfileContext';
import { useProfileAuth } from './useProfileAuth';

export const useProfile = (onNavigate, router) => {
  const { 
    loading, 
    refreshing, 
    isConnected,
    refreshProfile,
    firstName, 
    lastName, 
    userAvatar, 
    streakCount 
  } = useProfileContext();

  const {
    gateVisible,
    setGateVisible,
    handleProtectedAction,
    handleLogout,
    logoutModalVisible,
    isSavingProfile,
    handleSaveAndLogout,
    handleLogoutWithoutSaving,
    handleCancelLogout,
  } = useProfileAuth(isConnected, onNavigate, router);

  return {
    loading,
    refreshing,
    gateVisible,
    setGateVisible,
    firstName,
    lastName,
    userAvatar,
    streakCount,
    handleRefresh: refreshProfile,
    handleProtectedAction,
    handleLogout,
    logoutModalVisible,
    isSavingProfile,
    handleSaveAndLogout,
    handleLogoutWithoutSaving,
    handleCancelLogout,
  };
};
