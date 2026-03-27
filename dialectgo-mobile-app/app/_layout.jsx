import { Stack } from 'expo-router';
import { AuthProvider } from '../shared/context/AuthContext';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PaperProvider>
    </AuthProvider>
  );
}