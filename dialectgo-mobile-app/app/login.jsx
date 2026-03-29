import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Animated, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../shared/lib/supabase';
import IntroSplash from '../shared/components/IntroSplash';
import AuthInput from '../shared/components/AuthInput';
import SocialAuth from '../shared/components/SocialAuth';
import CustomButton from '../shared/components/CustomButton';

const { height } = Dimensions.get('window');

function WelcomeHeader({ isIntroFinished, contentOpacity, onTransition }) {
  if (!isIntroFinished) {
    return <IntroSplash onAnimationFinished={onTransition} />;
  }

  return (
    <Animated.View style={{ opacity: contentOpacity }} className="w-full px-10">
      <Text style={styles.greetingText} className="text-4xl font-black tracking-tighter">
        Maayong pagbalik!
      </Text>
      <Text className="text-slate-500 text-base font-bold mt-1">
        Learn More. Speak Better. Connect Easier.
      </Text>
      <Image 
        source={require('@assets/logo/jeepLogo.png')} 
        className="w-60 h-28 self-end mt-4 mr-[-20]"
        resizeMode="contain" 
      />
    </Animated.View>
  );
}

function LoginForm({ creds, setCreds, onLogin, loading, onSignUp, onForgotPassword }) {
  return (
    <View style={styles.formCard} className="flex-1 p-8">
      <Text style={styles.formTitle} className="mb-8 tracking-tighter">
        LOG IN
      </Text>
      
      <View className="space-y-4">
        <AuthInput 
          label="Email" 
          onChangeText={(t) => setCreds({...creds, email: t})} 
          style={styles.authArea}
        />
        <AuthInput 
          label="Password" 
          secureTextEntry 
          onChangeText={(t) => setCreds({...creds, password: t})} 
          style={styles.authArea}
        />
        <TouchableOpacity 
          className="self-end -mt-2" 
          onPress={onForgotPassword}
        >
          <Text className="text-slate-600 font-bold underline">Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      
      <CustomButton 
        title="LOG IN" 
        onPress={onLogin} 
        loading={loading} 
        className="mt-8"
        style={styles.loginBtn}
      />

      <SocialAuth />

      <View className="flex-row justify-center mt-10">
        <Text className="text-slate-700">Don't have an account? </Text>
        <TouchableOpacity onPress={onSignUp}>
          <Text className="font-black underline text-black">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Login() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isIntroFinished, setIsIntroFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState({ email: '', password: '' });

  // Animation Refs
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(height)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startTransition = () => {
    setIsIntroFinished(true);
    Animated.parallel([
      Animated.timing(logoTranslateY, { toValue: -height * 0.38, duration: 1000, useNativeDriver: true }),
      Animated.timing(formTranslateY, { toValue: 0, duration: 1000, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!creds.email || !creds.password) {
      alert("Palihog, isulod ang imong email ug password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signIn({
    email: creds.email,
    password: creds.password,
    });
    setLoading(false);
    if (error) alert(error.message);
    else router.replace('/(tabs)/Home');
  };

  if (!isMounted) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View 
        style={[styles.headerPosition, { transform: [{ translateY: logoTranslateY }] }]}
      >
        <WelcomeHeader 
          isIntroFinished={isIntroFinished}
          contentOpacity={contentOpacity}
          onTransition={startTransition}
        />
      </Animated.View>
      <Animated.View 
        style={[styles.formContainer, { transform: [{ translateY: formTranslateY }] }]}
        className="absolute bottom-0 w-full"
      >
        <LoginForm 
          creds={creds}
          setCreds={setCreds}
          onLogin={handleLogin}
          loading={loading}
          onSignUp={() => router.push('/auth/Register')}
          onForgotPassword={() => router.push('/auth/ForgotPassword')}
        />
      </Animated.View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  headerPosition: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    top: height / 2 - 20,
  },
  greetingText: {
    color: '#FFBC00',
    fontWeight: '900',
  },
  loginBtn: {
    backgroundColor: '#FFBC00',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
  },
  authArea: {
    backgroundColor: '#ffffff',
    borderRadius: 35,
    height: 65,
    elevation: 5,
  },
  formTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  formContainer: {
    height: height * 0.72,
  },
  formCard: {
    backgroundColor: '#FFF2C5',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    elevation: 24, 
  }
});