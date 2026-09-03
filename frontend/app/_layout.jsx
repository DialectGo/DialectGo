import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ProfileProvider } from '../src/shared/context/ProfileContext';
import { ToastProvider } from '../src/shared/context/ToastContext';
import React, { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import OfflineScreen from '../src/shared/components/OfflineScreen';

export default function RootLayout() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent />
      
      <ToastProvider>
        <ProfileProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: 250,
            }}
          />
          {!isConnected && <OfflineScreen />}
        </ProfileProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}