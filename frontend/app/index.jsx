import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router'; // Para sa auto-redirect
import { supabase } from '../src/shared/api/supabase';
import OpeningAnimation from '../src/components/OpeningAnimation';
import AutoSplash from '../src/components/AutoSplash';
import Onboarding from '../src/components/Onboarding';
import AuthTransition from './auth/AuthTransition';

import { getSavedProfiles } from '../src/shared/services/profile/deviceProfileService';

export default function MainIndex() {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [session, setSession] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 1. Check session once when the app starts
  useEffect(() => {
    const checkState = async () => {
      try {
        // Enforce a 10-second timeout on the entire startup check
        // If the backend (Render) is asleep, we won't wait forever.
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Startup timeout')), 10000)
        );

        const logicPromise = (async () => {
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);

          if (session) {
            setCurrentScreen('home'); 
            return; 
          }

          const profiles = await getSavedProfiles();
          if (profiles && profiles.length > 0) {
            setCurrentScreen('auth'); 
          } else {
            setCurrentScreen('intro-splash'); 
          }
        })();

        await Promise.race([logicPromise, timeoutPromise]);
        
      } catch (error) {
        console.warn("Startup check timed out or failed (this is normal if network is slow):", error);
        // On any failure, default to the safest possible state
        // This ensures the user is never stuck on 'loading'
        setCurrentScreen('intro-splash');
      }
    };

    checkState();

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleIntroFinish = () => setCurrentScreen('onboarding');
  const handleAutoFinish = () => setCurrentScreen('home');
  const handleOnboardingFinish = () => session ? setCurrentScreen('home') : setCurrentScreen('auth');

  // STEP 4: Redirect to Tabs if authenticated
  if (currentScreen === 'home' || (currentScreen === 'auth' && session)) {
    return <Redirect href="/(tabs)/Home" />;
  }

return (
    <View style={styles.container}>
      {/* 1. Loading state while checking Supabase */}
      {currentScreen === 'loading' && <ActivityIndicator size="large" color="#FFD54F" />}

      {/* 2. New User: Shows Opening Animation */}
      {currentScreen === 'intro-splash' && (
        <OpeningAnimation onFinish={handleIntroFinish} />
      )}

      {/* 3. Existing User: Shows Splash that fades out automatically */}
      {currentScreen === 'auto-splash' && (
        <AutoSplash onFinish={handleAutoFinish} />
      )}

      {currentScreen === 'onboarding' && (
        <Onboarding onFinish={handleOnboardingFinish} />
      )}

      {currentScreen === 'auth' && !session && (
        <AuthTransition />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
});