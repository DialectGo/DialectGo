import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,

  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../src/features/auth/styles/LoginStyles';
import { useRouter } from 'expo-router';
import { supabase } from '../src/shared/api/supabase';
import { endpoints } from '../src/shared/api/client';
import axios from 'axios';
import { FontAwesome5 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useProfileContext } from '../src/shared/context/ProfileContext';
import { useToast } from '../src/shared/context/ToastContext';
import AnimatedJeep from '../src/features/auth/components/AnimatedJeep';

WebBrowser.maybeCompleteAuthSession();

const LOGIN_URL = endpoints.USER_LOGIN;

export default function LogIn({ onSwitch, onSuccess, panHandlers }) {
  const router = useRouter();
  const { refreshProfile } = useProfileContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  // --- LOGIN LOGIC ---
  const handleLogin = async (email, password) => {
    let newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const response = await axios.post(LOGIN_URL, {
        email,
        password,
      });

      // 1. Extract the session info from your backend response
      const { session } = response.data.data;

      // 2. CRITICAL: Manually set the session in the Supabase client
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      if (sessionError) throw sessionError;

      console.log("Supabase session synced successfully");

      await AsyncStorage.removeItem('@guest_mode');
      await AsyncStorage.setItem('@user_role', 'authenticated');

      refreshProfile();

      if (onSuccess) {
        onSuccess();
      } else {
        // Replace '/(tabs)' with whatever your home/dashboard route is
        router.replace('../(tabs)/Home');
      }

      return response.data;

    } catch (error) {
      console.error("Login Error:", error);
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';

      // Inline auth error handling
      if (errorMsg.toLowerCase().includes('credential') || errorMsg.toLowerCase().includes('password') || errorMsg.toLowerCase().includes('email')) {
        setErrors({ email: ' ', password: errorMsg });
      } else {
        showToast(errorMsg, 'error', 'Login Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const redirectUrl = makeRedirectUri({ scheme: 'dialectgo' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (result.type === 'success' && result.url) {
          console.log("Supabase WebBrowser Google Login success! URL:", result.url);

          // Extract tokens from the URL hash
          const hashSplit = result.url.split('#');
          if (hashSplit.length > 1) {
            const params = {};
            hashSplit[1].split('&').forEach(param => {
              const [key, value] = param.split('=');
              params[key] = decodeURIComponent(value);
            });

            console.log("Parsed OAuth Params keys:", Object.keys(params));
            console.log("Has access_token:", !!params.access_token);
            console.log("Has refresh_token:", !!params.refresh_token);

            if (params.access_token && params.refresh_token) {
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: params.access_token,
                refresh_token: params.refresh_token,
              });
              if (sessionError) {
                console.error("setSession error:", sessionError);
                throw sessionError;
              }
              console.log("Successfully set Supabase OAuth session! Session Data:", sessionData ? (sessionData.session ? 'Exists' : 'Null') : 'No Data');
            }
          }

          await AsyncStorage.removeItem('@guest_mode');
          await AsyncStorage.setItem('@user_role', 'authenticated');

          refreshProfile();

          if (onSuccess) onSuccess();
          else router.replace('../(tabs)/Home');
        }
      }

    } catch (error) {
      console.error("Google Sign-In Error:", error);
      showToast(error.message || 'Authentication failed', 'error', 'Google Sign-In Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* --- HEADER SECTION --- */}
        <View style={styles.topHalf}>
          <Text style={styles.welcomeTextBold}>Maayong pagbalik!</Text>
          <Text style={styles.welcomeSubtitle}>Learn More. Speak Better. Connect Easier</Text>

          <AnimatedJeep />
        </View>

        {/* --- YELLOW BUBBLE CARD --- */}
        <View style={[styles.loginCard, { paddingBottom: 0, paddingHorizontal: 0 }]}>

          {panHandlers && (
            <View {...panHandlers} style={styles.dragHandler}>
              <View style={styles.closeIndicator} />
            </View>
          )}

          <ScrollView
            contentContainerStyle={[styles.scrollContainer, { paddingBottom: 250, paddingHorizontal: 25 }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.cardLabel}>LOG IN</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Email</Text>
              <TextInput
                style={[styles.bubbleInput, errors.email ? { borderColor: '#FF4D4D', borderWidth: 1.5 } : null]}
                placeholder="Enter your email"
                placeholderTextColor="#BDBDBD"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
              />
              {errors.email && errors.email !== ' ' && <Text style={{ color: '#FF4D4D', fontSize: 12, marginTop: 4, marginLeft: 10, fontWeight: 'bold' }}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Password</Text>
              <View style={[styles.bubbleInput, { flexDirection: 'row', alignItems: 'center', paddingRight: 15, paddingVertical: 0 }, errors.password ? { borderColor: '#FF4D4D', borderWidth: 1.5 } : null]}>
                <TextInput
                  style={{ flex: 1, paddingVertical: Platform.OS === 'ios' ? 12 : 10, color: '#000' }}
                  placeholder="••••••••"
                  placeholderTextColor="#BDBDBD"
                  secureTextEntry={secureTextEntry}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: null, email: null });
                  }}
                />
                <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                  <FontAwesome5 name={secureTextEntry ? "eye-slash" : "eye"} size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={{ color: '#FF4D4D', fontSize: 12, marginTop: 4, marginLeft: 10, fontWeight: 'bold' }}>{errors.password}</Text>}
            </View>

            <TouchableOpacity style={styles.forgotBtn}
              onPress={() => {
                router.push({
                  pathname: '../auth/ForgotPassword',
                  params: { email }
                });
              }}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bubblePrimaryBtn}
              activeOpacity={0.8}
              onPress={() => handleLogin(email, password)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryBtnText}>LOG IN</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.lineText}>OR</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.googleBtnContainer}>
              <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={loading}>
                <FontAwesome5 name="google" size={20} color="#DB4437" />
                <Text style={styles.googleBtnText}>Sign In with Google</Text>
              </TouchableOpacity>
              <Text style={styles.soonText}>More sign-in options coming soon...</Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onSwitch) onSwitch();
                  else router.push('../auth/Register');
                }}>
                <Text style={styles.footerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}