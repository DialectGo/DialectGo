import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import IntroSplash from '../shared/components/IntroSplash';
import Onboarding from '../shared/components/Onboarding';
import AuthTransition from './auth/AuthTransition'; // Yung code na ginawa natin kanina

export default function MainIndex() {
  const [currentScreen, setCurrentScreen] = useState('splash');

  // 1. Splash Logic: Kusang lilipat pagkatapos ng animation
  const handleSplashFinish = () => {
    setCurrentScreen('onboarding');
  };

  // 2. Onboarding Logic: Lilipat sa Welcome/Auth screen
  const handleOnboardingFinish = () => {
    setCurrentScreen('auth');
  };

  return (
    <View style={styles.container}>
      {/* STEP 1: SPLASH (First thing to see) */}
      {currentScreen === 'splash' && (
        <IntroSplash onFinish={handleSplashFinish} />
      )}

      {/* STEP 2: ONBOARDING */}
      {currentScreen === 'onboarding' && (
        <Onboarding onFinish={handleOnboardingFinish} />
      )}

      {/* STEP 3: AUTH (Yung may Bee logo at Bottom Sheet) */}
      {currentScreen === 'auth' && (
        <AuthTransition />
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