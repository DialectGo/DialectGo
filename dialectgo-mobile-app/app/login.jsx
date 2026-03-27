import React, { useState, useRef } from 'react';
import { StyleSheet, View, Image, Animated, Dimensions } from 'react-native';
import { Text, Button, TextInput, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../shared/lib/supabase';
import IntroSplash from '../shared/components/IntroSplash';
import finalLogoImg from '@assets/logo/Logo.png';
import googleLogo from '@assets/logo/googleLogo.png';
import facebookLogo from '@assets/logo/facebookLogo.jpg';

const { height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const [isIntroFinished, setIsIntroFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState({ email: '', password: '' });

  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(height)).current;

  const startTransition = () => {
    setIsIntroFinished(true);
    Animated.parallel([
      Animated.timing(logoTranslateY, { toValue: -height * 0.35, duration: 800, useNativeDriver: true }),
      Animated.timing(formTranslateY, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(creds);
    setLoading(false);
    if (error) alert(error.message);
    else router.replace('/(tabs)/Home');
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <Animated.View style={[styles.logoMasterContainer, { transform: [{ translateY: logoTranslateY }] }]}>
        {!isIntroFinished ? (
          <IntroSplash onAnimationFinished={startTransition} />
        ) : (
          <Image source={finalLogoImg} style={styles.finalLogo} resizeMode="contain" />
        )}
      </Animated.View>

      <Animated.View style={[styles.formWrapper, { transform: [{ translateY: formTranslateY }] }]}>
        <View style={styles.formCard}>
          <Text variant="headlineLarge" style={styles.formTitle}>LOG IN</Text>
          <TextInput 
            label="Email" mode="outlined" style={styles.input} 
            onChangeText={(t) => setCreds({...creds, email: t})} 
          />
          <TextInput 
            label="Password" mode="outlined" secureTextEntry style={styles.input} 
            onChangeText={(t) => setCreds({...creds, password: t})} 
          />
          
          <Button mode="contained" style={styles.loginBtn} buttonColor="#F2F2F2" textColor="#000" 
            onPress={handleLogin} loading={loading}>LOG IN</Button>

          <View style={styles.socialRow}>
            <IconButton icon={() => <Image source={googleLogo} style={styles.socialIcon} />} mode="contained" containerColor="#F2F2F2" />
            <IconButton icon={() => <Image source={facebookLogo} style={styles.socialIcon} />} mode="contained" containerColor="#F2F2F2" />
          </View>
          <View style={styles.footerRow}>
            <Text variant="bodyMedium" style={styles.footerText}>
                Don't have an account?
            </Text>
            <Button 
                mode="text" 
                compact 
                textColor="#000" 
                onPress={() => router.push('/auth/Register')} 
                style={styles.registerBtn}
                labelStyle={styles.registerBtnLabel}
            >
                Sign Up
            </Button>
        </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FBBF24' },
  logoMasterContainer: { position: 'absolute', top: height / 2 - 150, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  finalLogo: { width: 280, height: 280, marginTop: -60 },
  formWrapper: { position: 'absolute', bottom: 0, width: '100%', height: height * 0.7 },
  formCard: { flex: 1, backgroundColor: '#D9D9D9', borderTopLeftRadius: 45, borderTopRightRadius: 45, padding: 24 },
  formTitle: { textAlign: 'center', fontWeight: 'bold', marginVertical: 20 },
  input: { marginBottom: 12 },
  loginBtn: { marginTop: 20, borderRadius: 10, paddingVertical: 5 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 20 },
  socialIcon: { width: 25, height: 25 }
});