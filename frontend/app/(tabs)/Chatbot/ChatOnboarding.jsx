import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Image,  StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
// I-import ang styles dito
import { styles } from '../../../shared/styles/ChatOnboardingStyles'; 
import ProfileTopBar from '../../../shared/components/ProfileTopBar';

export default function DialectBot() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      <ProfileTopBar title="DialectBot" />

      <View style={styles.content}>
        {/* CHARACTER IMAGE */}
        <Image 
          source={require('../../../assets/images/avatar.png')} 
          style={styles.characterImg}
          resizeMode="contain"
        />

        {/* TEXT SECTION */}
        <Text style={styles.welcomeText}>Welcome to{"\n"}DialectBot</Text>
        
        <Text style={styles.descriptionText}>
          DialectBot can help you navigate and learn more about DialectGo.
        </Text>

        {/* START CHAT BUTTON */}
        <TouchableOpacity 
          style={styles.startBtn}
          activeOpacity={0.8}
          onPress={() => router.push('/Chatbot/ChatInterface')} 
        >
          <Text style={styles.startBtnText}>Start Chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}