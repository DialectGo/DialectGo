import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useRouter } from 'expo-router';
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