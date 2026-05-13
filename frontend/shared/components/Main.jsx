import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

// 1. Ayusin ang Imports (Base sa iyong folder structure)
import IntroSplash from './IntroSplash'; 
import Onboarding from './Onboarding';
import AuthTransition from '../../app/AuthTransition'; // Lumabas sa components at shared, pasok sa app

export default function Main() {
  // 'splash' ang default na screen pagbukas ng app
  const [currentScreen, setCurrentScreen] = useState('splash');

  // Lilipat sa Onboarding pagkatapos ng Splash animation
  const handleSplashFinish = () => {
    setCurrentScreen('onboarding');
  };

  // 2. Pupunta na tayo sa AuthTransition pagkatapos ng Onboarding
  const handleOnboardingFinish = () => {
    setCurrentScreen('authtransition');
  };

  const handleLoginSuccess = () => {
    console.log("User Logged In! Redirecting to Home...");
    // Dito mo ilalagay ang logic para pumasok sa main app
  };

  return (
    <View style={styles.container}>
      {/* 3. Updated Logic para magpalit ng screen */}
      {currentScreen === 'splash' && (
        <IntroSplash onFinish={handleSplashFinish} />
      )}
      
      {currentScreen === 'onboarding' && (
        <Onboarding onFinish={handleOnboardingFinish} />
      )}

      {currentScreen === 'authtransition' && (
        <AuthTransition onLoginSuccess={handleLoginSuccess} />
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