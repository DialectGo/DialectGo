import { useState, useCallback } from 'react';
import { clearAuthSession } from '../../services/profile/userService';

export const useProfileAuth = (isConnected, onNavigate, router) => {
  const [gateVisible, setGateVisible] = useState(false);

  const handleProtectedAction = useCallback((targetPath) => {
    if (!isConnected) {
      setGateVisible(true);
      return;
    }
    router.push(targetPath);
  }, [isConnected, router]);

  const handleLogout = useCallback(async () => {
    await clearAuthSession();
    if (router.dismissAll) {
      router.dismissAll();
    }
    router.replace('/login');
  }, [router]);

  return {
    gateVisible, setGateVisible, handleProtectedAction, handleLogout
  };
};
