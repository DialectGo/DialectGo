import { useState, useCallback } from 'react';
import { clearAuthSession } from '../../services/profile/userService';
import { saveProfileToDevice, getSavedProfiles } from '../../services/profile/deviceProfileService';
import { useProfileContext } from '../../context/ProfileContext';

export const useProfileAuth = (isConnected, onNavigate, router) => {
  const [gateVisible, setGateVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const profileContext = useProfileContext();

  const handleProtectedAction = useCallback((targetPath) => {
    if (!isConnected) {
      setGateVisible(true);
      return;
    }
    router.push(targetPath);
  }, [isConnected, router]);

  // Show the logout confirmation modal only if the user hasn't saved their profile yet.
  const handleLogout = useCallback(async () => {
    try {
      const { supabase } = await import('../../api/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId) {
        const savedProfiles = await getSavedProfiles();
        const isAlreadySaved = savedProfiles.some(p => p.user_id === userId);
        
        if (isAlreadySaved) {
          // If already saved, just update/save again and log out directly
          await handleSaveAndLogout();
          return;
        }
      }
    } catch (error) {
      console.warn('Error checking saved profiles:', error);
    }
    
    // If not saved (or error), show the modal to ask
    setLogoutModalVisible(true);
  }, [handleSaveAndLogout]);

  // Save profile to device, then sign out and navigate
  const handleSaveAndLogout = useCallback(async () => {
    setIsSavingProfile(true);
    try {
      // Gather current user info from profile context
      const { firstName, lastName, userAvatar } = profileContext;
      const avatarName = typeof userAvatar === 'number'
        ? null // It's a require() reference, we can't extract name here
        : userAvatar;

      // Try to get email from Supabase session
      const { supabase } = await import('../../api/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email || '';
      const authProvider = session?.user?.app_metadata?.provider || 'email';

      // Find avatar filename from the constants
      const { availableAvatars } = await import('../../hooks/profile/constants');
      const matchedAvatar = availableAvatars.find(a => a.source === userAvatar);
      const avatarUrl = matchedAvatar?.name || null;

      await saveProfileToDevice({
        email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        auth_provider: authProvider,
      });
    } catch (error) {
      console.warn('Failed to save profile to device (continuing logout):', error);
    } finally {
      setIsSavingProfile(false);
    }

    await clearAuthSession(true); // <--- Keep the token valid on the server for quick login!
    setLogoutModalVisible(false);
    if (router.dismissAll) router.dismissAll();
    router.replace('/auth/AuthTransition');
  }, [profileContext, router]);

  // Log out without saving profile
  const handleLogoutWithoutSaving = useCallback(async () => {
    await clearAuthSession();
    setLogoutModalVisible(false);
    if (router.dismissAll) router.dismissAll();
    router.replace('/auth/AuthTransition');
  }, [router]);

  const handleCancelLogout = useCallback(() => {
    setLogoutModalVisible(false);
  }, []);

  return {
    gateVisible,
    setGateVisible,
    handleProtectedAction,
    handleLogout,
    logoutModalVisible,
    isSavingProfile,
    handleSaveAndLogout,
    handleLogoutWithoutSaving,
    handleCancelLogout,
  };
};
