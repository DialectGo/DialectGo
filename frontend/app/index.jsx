import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router'; // Para sa auto-redirect
import { supabase } from '../shared/lib/supabase';
import IntroSplash from '../shared/components/IntroSplash';
import Onboarding from '../shared/components/Onboarding';
import AuthTransition from './auth/AuthTransition';

export default function MainIndex() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [session, setSession] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 1. Check session once when the app starts
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthChecking(false);
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSplashFinish = () => {
    setCurrentScreen('onboarding');
  };

  const handleOnboardingFinish = () => {
    // Kung may session na, 'home' na agad. Kung wala, 'auth'.
    if (session) {
      setCurrentScreen('home');
    } else {
      setCurrentScreen('auth');
    }
  };

  // STEP 4: Redirect to Tabs if authenticated
  if (currentScreen === 'home' || (currentScreen === 'auth' && session)) {
    return <Redirect href="/(tabs)/Home" />;
  }

  return (
    <View style={styles.container}>
      {/* STEP 1: SPLASH */}
      {currentScreen === 'splash' && (
        <IntroSplash onFinish={handleSplashFinish} />
      )}

      {/* STEP 2: ONBOARDING */}
      {currentScreen === 'onboarding' && (
        <Onboarding onFinish={handleOnboardingFinish} />
      )}

      {/* STEP 3: AUTH (Only shows if no session) */}
      {currentScreen === 'auth' && !session && (
        <AuthTransition />
      )}
      
      {/* Loading state just in case session check is slow during transition */}
      {isAuthChecking && currentScreen === 'onboarding' && (
         <ActivityIndicator style={StyleSheet.absoluteFill} color="#FBBF24" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});