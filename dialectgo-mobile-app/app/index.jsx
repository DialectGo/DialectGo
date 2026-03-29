import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { supabase } from '../shared/lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const checkSession = async () => {
    try {
      // In V1, we use auth.user() and auth.session() 
      // but the safest way is the listener:
      const session = supabase.auth.session();
      const user = supabase.auth.user();

      if (user && session) {
        setSession(session);
      }
    } catch (e) {
      console.log("Session check failed:", e.message);
    } finally {
      setLoading(false);
    }
  };

  checkSession();

  // Listen for auth changes (Login/Logout)
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
    }
  );

  return () => {
    if (authListener) authListener.unsubscribe();
  };
}, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#FBBF24' }}>
        <ActivityIndicator color="#000" size="large" />
      </View>
    );
  }

  return session ? <Redirect href="/(tabs)/Home" /> : <Redirect href="/login" />;
}