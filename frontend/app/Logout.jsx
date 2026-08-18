import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../src/shared/api/supabase';
import { router } from 'expo-router';

export const handleLogout = async () => {
  try {

    // Supabase logout (works for logged-in + anonymous users)
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    // Remove ONLY auth/session-related storage
    await AsyncStorage.multiRemove([
      '@user_token',
      '@user_role',
      '@user_metadata',
      '@guest_mode'
    ]);

    // Optional: clear guest cache/history too
    await AsyncStorage.multiRemove([
      '@guest_history_cache'
    ]);

    // Redirect to auth screen
    router.replace('/auth/AuthTransition');

  } catch (error) {
    console.error("Error during logout:", error.message);

    // Still force clear local session
    await AsyncStorage.multiRemove([
      '@user_token',
      '@user_role',
      '@user_metadata',
      '@guest_mode',
      '@guest_history_cache'
    ]);

    router.replace('/auth/AuthTransition');
  }
};