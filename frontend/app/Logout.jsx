import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../src/shared/api/supabase';
import { router } from 'expo-router';

export const handleLogout = async () => {
  try {
    // Use scope: 'local' to ensure the local session token is cleared
    // even if the network request to invalidate the server session fails
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      console.warn("Supabase signout returned error, clearing local anyway:", error);
    }
  } catch (err) {
    console.warn("Network error during signout, forcing local clear:", err);
  }

  // Force wipe all auth/session-related storage including Supabase's internal tokens
  // Supabase stores tokens with key format: sb-{project-ref}-auth-token
  // The old filter only checked for 'supabase' which missed the 'sb-' prefixed keys
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const authKeys = allKeys.filter(key => 
      key.includes('supabase') || 
      key.startsWith('sb-') ||      // Catches sb-{project-ref}-auth-token
      key.startsWith('@user_') ||    // Catches @user_token, @user_role, @user_metadata
      key.startsWith('@guest_')      // Catches @guest_mode, @guest_history_cache, @guest_saved_words
    );
    
    if (authKeys.length > 0) {
      await AsyncStorage.multiRemove(authKeys);
    }
  } catch (storageErr) {
    console.error("Error clearing async storage:", storageErr);
    // Nuclear fallback: if filtering fails, clear everything
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error("Failed to clear all storage:", e);
    }
  }

  // Redirect to auth screen
  router.replace('/auth/AuthTransition');
};