import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../api/supabase';

export const getAuthMode = async () => {

  // Check local role first
  const role = await AsyncStorage.getItem('@user_role');

  if (role === 'guest') {

    const guestMode = await AsyncStorage.getItem('@guest_mode');

    return {
      isGuest: true,
      guestMode,
      isOfflineGuest: guestMode === 'offline'
    };
  }

  // Check authenticated session
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return {
    isGuest: !session,
    guestMode: null,
    isOfflineGuest: false
  };
};