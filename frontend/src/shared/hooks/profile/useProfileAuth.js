import { useState, useCallback } from 'react';
import { clearAuthSession } from '../../services/profile/userService';

export const useProfileAuth = (isGuest, isConnected, onNavigate, router) => {
  const [gateVisible, setGateVisible] = useState(false);

  const handleProtectedAction = useCallback((targetPath) => {
    if (isGuest || !isConnected) {
      setGateVisible(true);
      return;
    }
    router.push(targetPath);
  }, [isGuest, isConnected, router]);

  const handleLogout = useCallback(async () => {
    await clearAuthSession();
    if (onNavigate) {
      onNavigate('auth');
    } else {
      router.replace('/auth/AuthTransition');
    }
  }, [onNavigate, router]);

  return {
    gateVisible, setGateVisible, handleProtectedAction, handleLogout
  };
};
