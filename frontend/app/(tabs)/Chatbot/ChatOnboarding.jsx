import React from 'react';
import { Image, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
// I-import ang styles dito
import { styles } from '../../../shared/styles/ChatOnboardingStyles'; 

export default function DialectBot() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Image 
            source={require('../../../assets/icons/back_arrow.png')} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DialectBot</Text>
        <View style={{ width: 40 }} /> 
      </View>

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