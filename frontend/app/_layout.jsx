import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ProfileProvider } from '../src/shared/context/ProfileContext';
import { ToastProvider } from '../src/shared/context/ToastContext';

export default function RootLayout() {
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
        </ProfileProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}