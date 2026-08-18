import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent />

      <Stack
        screenOptions={{
          headerShown: false,

          // Smooth screen transition
          animation: 'slide_from_right',

          // Slightly faster and smoother
          animationDuration: 250,
        }}
      />
    </SafeAreaProvider>
  );
}