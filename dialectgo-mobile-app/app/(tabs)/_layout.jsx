import "../../global.css";
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';
import TopBar from './TopBar';
import BottomBar from './BottomBar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <TopBar />
          <View style={{ flex: 1, backgroundColor: 'blue' }}> 
            <Slot /> 
        </View>
        <BottomBar />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});