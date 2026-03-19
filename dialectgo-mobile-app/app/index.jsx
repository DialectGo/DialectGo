import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Image, Animated, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, TextInput, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import bubbleTextImg from '@assets/logo/BubbleText.png';
import dotImg from '@assets/logo/Dot.png';
import goProfileImg from '@assets/logo/GoProfile.png'; 
import finalLogoImg from '@assets/logo/Logo.png'; 
import googleLogo from '@assets/logo/googleLogo.png';
import facebookLogo from '@assets/logo/facebookLogo.jpg';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://egalempypegfsegmomud.supabase.co', 'sb_publishable_Q-n8s648TscunnWlP0Sefg_8ebPONMt');
const { height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const [animationFinished, setAnimationFinished] = useState(false);

    // 1. Add email and password to your useState hooks
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false); // For button feedback


  // Animation Refs
  const bubbleScale = useRef(new Animated.Value(5)).current; 
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;
  const goOpacity = useRef(new Animated.Value(0)).current;
  const goScale = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(height)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;


const handleLogin = async () => {
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  setLoading(true);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  setLoading(false);

  if (error) {
    alert(error.message);
  } else {
    // Navigate only on success
    router.push('/(tabs)/Home');
  }
};

  useEffect(() => {
    const runDotTypingSequence = () => [
      Animated.timing(dot1Opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(dot2Opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(dot3Opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(dot1Opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(dot2Opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(dot3Opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ])
    ];

    // Frame-by-Frame logic based on provided sequence
    Animated.sequence([
      Animated.delay(500), 
      Animated.parallel([
        Animated.timing(bubbleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(bubbleScale, { toValue: 1, duration: 800, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      ]),
      ...runDotTypingSequence(),
      ...runDotTypingSequence(),
      Animated.parallel([
        Animated.timing(dot1Opacity, { toValue: 1, duration: 10, useNativeDriver: true }),
        Animated.timing(dot2Opacity, { toValue: 1, duration: 10, useNativeDriver: true }),
        Animated.timing(dot3Opacity, { toValue: 1, duration: 10, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(goOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(goScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]),
      Animated.delay(800), 
      Animated.parallel([
        Animated.timing(logoTranslateY, { toValue: -height * 0.35, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ]).start(() => setAnimationFinished(true));
  }, []);

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      {/* <Animated.View style={[styles.headerTextContainer, { opacity: headerOpacity }]}>
        <Text variant="headlineMedium" className="text-slate-800 font-bold">Maayong Pagbalik!</Text>
        <Text variant="labelMedium" className="text-gray-700 ml-2">Translate Cebuano, Connect Everywhere.</Text>
      </Animated.View> */}

      <Animated.View style={[styles.logoMasterContainer, { transform: [{ translateY: logoTranslateY }] }]}>
        {!animationFinished ? (
          <View style={styles.logoWrapper}>
            {/* Main Bubble */}
            <Animated.Image 
              source={bubbleTextImg} 
              style={[styles.bubble, { opacity: bubbleOpacity, transform: [{ scale: bubbleScale }] }]} 
            />
            
            {/* Slanted Dots */}
            <Animated.View style={[styles.dotsContainer, { transform: [{ rotate: '-10deg' }] }]}>
              <Animated.Image source={dotImg} style={[styles.dot, { opacity: dot1Opacity }]} />
              <Animated.Image source={dotImg} style={[styles.dot, { opacity: dot2Opacity }]} />
              <Animated.Image source={dotImg} style={[styles.dot, { opacity: dot3Opacity }]} />
            </Animated.View>

            {/* Overlapping GO Cloud Icon */}
            <Animated.Image 
              source={goProfileImg} 
              style={[
                styles.goIcon, 
                { 
                  opacity: goOpacity, 
                  transform: [{ scale: goScale }, { rotate: '-2deg' }] 
                }
              ]} 
            />
          </View>
        ) : (
          /* Matched finalLogo size to the combined animated elements */
          <Image source={finalLogoImg} style={styles.finalLogo} resizeMode="contain" />
        )}
      </Animated.View>

      {/* Login Form Container */}
      <Animated.View style={[styles.formWrapper, { transform: [{ translateY: formTranslateY }] }]}>
        <View className="h-full w-full bg-[#D9D9D9] rounded-t-[45px] px-6 pt-10 pb-12 shadow-lg">
          <Text variant="headlineLarge" className="text-slate-800 p-5 text-center font-bold">LOG IN</Text>
          <TextInput label="Email" mode="outlined" style={styles.input} keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none"/>
          <TextInput label="Password" mode="outlined" style={styles.input} secureTextEntry value={password} onChangeText={setPassword}/> 
          <View className="items-end">
            <Button mode="text" textColor="#000">Forgot Password?</Button>
          </View>
          <Button 
  mode="contained" 
  style={styles.loginBtn} 
  buttonColor="#F2F2F2" 
  textColor="#000" 
  onPress={handleLogin} // Trigger the function
  loading={loading}     // Show spinner while waiting
  disabled={loading}
>
  LOG IN
</Button>
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-gray-500" />
            <Text className="mx-4 text-gray-500">Or continue with</Text>
            <View className="flex-1 h-[1px] bg-gray-500" />
          </View>
          <View className="flex-row justify-center gap-4">
            <IconButton icon={() => <Image source={googleLogo} style={styles.socialIcon} />} mode="contained" containerColor="#F2F2F2" style={styles.socialBtn} />
            <IconButton icon={() => <Image source={facebookLogo} style={styles.socialIcon} />} mode="contained" containerColor="#F2F2F2" style={styles.socialBtn} />
          </View>
          <View className="flex-row items-center justify-center mt-6">
            <Text>Don't have an account?</Text>
            <Button mode="text" textColor="#000" onPress={() => router.push('/(tabs)/auth/Register')}>Sign Up</Button>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FBBF24' },
  headerTextContainer: { paddingHorizontal: 24, paddingTop: 8 },
  logoMasterContainer: {
    position: 'absolute',
    top: height / 2 - 150, // Changed from 130 to 150 to move the whole logo higher
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  logoWrapper: { 
    width: 250, 
    height: 250, 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'visible',
  },
  bubble: { 
    width: 240, 
    height: 220, 
    resizeMode: 'contain',
    zIndex: 1,
  },
  dotsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: '48%', 
    zIndex: 2,
  },
  dot: { 
    width: 22, 
    height: 22, 
    marginHorizontal: 3, 
    resizeMode: 'contain' 
  },
  goIcon: {
    position: 'absolute',
    width: 140, 
    height: 140, 
    top: -10, 
    alignSelf: 'center',
    resizeMode: 'contain',
    zIndex: 3,
  },
  finalLogo: { 
    width: 280,   // Increased to match the 240px bubble + overlapping GO cloud width
    height: 280,  // Increased to match the 220px bubble + -10px top overlap height
    marginTop: -60, // Moves the final static image slightly above to align with transition
  },
  formWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.7,
  },
  input: { marginBottom: 12 },
  loginBtn: { marginTop: 10, borderRadius: 10, paddingVertical: 5 },
  socialBtn: { width: 60, height: 50, borderRadius: 10 },
  socialIcon: { width: 25, height: 25 },
});