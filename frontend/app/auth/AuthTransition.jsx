import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { endpoints } from '../../shared/config/apiConfig';
import { styles } from '../../shared/styles/AuthTransitionStyles';

// FIXED IMPORTS: 
// 1. '../login' dahil nasa app/login.jsx (lowercase 'l')
// 2. './Register' dahil magkatabi sila sa auth/ folder
import LogIn from '../login'; 
import SignUp from './Register'; 

const { height } = Dimensions.get('window');
const MAX_UP = height * 0.05; 
const MIN_DOWN = height;      

export default function AuthTransition() {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(height)).current; 
  const [activeForm, setActiveForm] = useState('login'); 
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  // --- ANIMATION LOGIC (PAN RESPONDER) ---
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(MAX_UP + gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 150) {
          closeSheet();
        } else {
          openSheet();
        }
      },
    })
  ).current;

  const handlePress = (formType) => {
    setActiveForm(formType);
    openSheet();
  };

  const openSheet = () => {
    Animated.spring(translateY, {
      toValue: MAX_UP,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: MIN_DOWN,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // SUCCESS REDIRECT: Kapag naka-login na, pupunta sa Home
  const handleLoginSuccess = () => {
    router.replace('/(tabs)/Home');
  };

  const parseJsonResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`);
    }

    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error(`Invalid JSON response: ${text}`);
      }
    }

    throw new Error(`Expected JSON response but got ${contentType}: ${text}`);
  };

  const handleContinueAsGuest = async () => {
    setIsGuestLoading(true);

    try {
      // Detect internet status
      const networkState = await NetInfo.fetch();

      // =========================
      // OFFLINE GUEST MODE
      // =========================
      if (!networkState.isConnected) {

        // Local-only guest session
        const offlineGuest = {
          id: 'offline-guest',
          role: 'guest',
          isOfflineGuest: true,
          createdAt: new Date().toISOString()
        };

        // Persist local guest state
        await AsyncStorage.setItem(
          '@guest_mode',
          'offline'
        );

        await AsyncStorage.setItem(
          '@user_role',
          'guest'
        );

        await AsyncStorage.setItem(
          '@user_metadata',
          JSON.stringify(offlineGuest)
        );

        // Offline cache containers
        await AsyncStorage.setItem(
          '@guest_history_cache',
          JSON.stringify([])
        );

        await AsyncStorage.setItem(
          '@guest_saved_words',
          JSON.stringify([])
        );

        router.replace('/(tabs)/Home');

        return;
      }

      // =========================
      // ONLINE GUEST MODE
      // =========================

      const response = await fetch(
        endpoints.GUEST_LOGIN,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const json = await parseJsonResponse(response);

      if (json.success && json.data?.session) {

        const { access_token, user } = json.data.session;

        await AsyncStorage.setItem(
          '@guest_mode',
          'online'
        );

        await AsyncStorage.setItem(
          '@user_token',
          access_token
        );

        await AsyncStorage.setItem(
          '@user_role',
          'guest'
        );

        await AsyncStorage.setItem(
          '@user_metadata',
          JSON.stringify(user)
        );

        await AsyncStorage.setItem(
          '@guest_history_cache',
          JSON.stringify([])
        );

        await AsyncStorage.setItem(
          '@guest_saved_words',
          JSON.stringify([])
        );

        router.replace('/(tabs)/Home');

      } else {
        throw new Error(
          json.message || "Failed to initialize guest mode."
        );
      }

    } catch (error) {

      console.error("Guest Mode Error:", error);

      Alert.alert(
        "Guest Mode Error",
        error.message || "Unable to initialize guest session."
      );

    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Content */}
      <View style={styles.content}>
        <Image 
          source={require('../../assets/logo/bee.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.brandText}>DialectGo</Text>
        <Text style={styles.tagline}>Bridge the gap, one word at a time.</Text>
      </View>

      {/* Landing Buttons */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.loginBtn} onPress={() => handlePress('login')}>
          <Text style={styles.loginBtnText}>LOG IN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpBtn} onPress={() => handlePress('signup')}>
          <Text style={styles.signUpBtnText}>SIGN UP</Text>
        </TouchableOpacity>

        {/* Continue as Guest Trigger */}
        <TouchableOpacity 
          style={[styles.guestBtn, { marginTop: 15, padding: 12, alignItems: 'center' }]} 
          onPress={handleContinueAsGuest}
          disabled={isGuestLoading}
        >
          {isGuestLoading ? (
            <ActivityIndicator color="#666" />
          ) : (
            <Text style={{ color: '#666', fontWeight: '600', textDecorationLine: 'underline' }}>
              Continue as Guest
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* --- ANIMATED SHEET --- */}
      <Animated.View 
        style={[
          styles.animatedOverlay, 
          { transform: [{ translateY: translateY }] }
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.dragHandler}>
          <View style={styles.closeIndicator} />
        </View>
        
        <View style={{ flex: 1 }}>
            {activeForm === 'login' ? (
              <LogIn 
                onSwitch={() => setActiveForm('signup')} 
                onSuccess={handleLoginSuccess} 
              />
            ) : (
              <SignUp 
                onSwitch={() => setActiveForm('login')} 
                onSuccess={handleLoginSuccess} 
              />
            )}
        </View>
      </Animated.View>
    </View>
  );
}