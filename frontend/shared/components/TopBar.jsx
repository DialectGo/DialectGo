import React from 'react';
import { Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router'; // 1. Import ang router

const TopBar = () => {
  const router = useRouter(); // 2. Initialize ang router

  const handlePress = () => {
    // 3. I-navigate sa path ng iyong ChatOnboarding
    router.push('/Chatbot/ChatOnboarding'); 
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <View style={styles.leftSection}>
            <Image
              source={require('../../assets/logo/bee.png')}
              style={styles.miniLogoHeader}
              resizeMode="contain"
            />
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity 
              style={styles.chatbotBtn} 
              onPress={handlePress} // 4. Connect ang function dito
              activeOpacity={0.6}
            >
              <Image
                source={require('../../assets/icons/botIcon.png')} 
                style={styles.chatbotIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFD54F', // Solid Yellow
    // Subtle shadow para sa depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000,
  },
  safeArea: {
    backgroundColor: '#FFD54F',
  },
  topBar: {
    flexDirection: 'row',
    height: 65, // In-adjust para maging komportable ang size
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  miniLogoHeader: {
    width: 40,
    height: 40,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chatbotBtn: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Translucent white box gaya ng back button mo
    borderRadius: 15, // Bubbly/Rounded corners
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chatbotIcon: {
    width: 28,
    height: 28,
    // tintColor: '#2D1606', // Opsyonal: gamitin ito kung monochrome ang icon mo
  },
});

export default TopBar;