import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../shared/lib/supabase';
import { router } from 'expo-router';

export const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await AsyncStorage.clear();
    router.replace('/login');
    
  } catch (error) {
    console.error("Error during logout:", error.message);
    router.replace('/login');
  }
};