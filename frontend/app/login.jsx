import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
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
import NetInfo from '@react-native-community/netinfo';

WebBrowser.maybeCompleteAuthSession();

const LOGIN_URL = endpoints.USER_LOGIN;

export default function LogIn({ onSwitch, onSuccess, panHandlers, initialEmail = '' }) {
  const router = useRouter();
  const { refreshProfile, hydrateProfileData } = useProfileContext();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleLoadingMsg, setGoogleLoadingMsg] = useState('');
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  // --- LOGIN LOGIC ---
  const handleLogin = async (email, password) => {
    let newErrors = {};
    const emailTrimmed = email.trim();
    const passTrimmed = password.trim();

    // 1. Empty Field / Presence Validation
    if (!emailTrimmed) newErrors.email = "Email is required";
    if (!passTrimmed) newErrors.password = "Password is required";

    // 2. Email Format Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (emailTrimmed && !emailRegex.test(emailTrimmed)) {
      newErrors.email = "Please enter a valid Gmail address (e.g. user@gmail.com)";
    }

    // 3. Password Length Check
    if (passTrimmed && passTrimmed.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 4. Network Connectivity Check
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      showToast("No internet connection. Please check your network and try again.", "error", "Offline");
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
    if (loading || googleLoading) return;
    setLoading(true);
    try {
      const redirectUrl = makeRedirectUri({ scheme: 'dialectgo' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (result.type === 'success' && result.url) {
          // Show full-screen loading overlay from this point
          setGoogleLoading(true);
          setGoogleLoadingMsg('Authenticating...');

          // Extract tokens from the URL hash
          const hashSplit = result.url.split('#');
          if (hashSplit.length > 1) {
            const params = {};
            hashSplit[1].split('&').forEach(param => {
              const [key, value] = param.split('=');
              params[key] = decodeURIComponent(value);
            });

            if (params.access_token && params.refresh_token) {
              setGoogleLoadingMsg('Setting up your session...');

              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: params.access_token,
                refresh_token: params.refresh_token,
              });
              if (sessionError) {
                console.error("setSession error:", sessionError);
                throw sessionError;
              }

              // ─── STEP 1: Immediately hydrate profile from Google metadata ───
              // This ensures screens NEVER show "Guest User"
              const user = sessionData?.session?.user;
              const metadata = user?.user_metadata || {};
              const identityData = user?.identities?.[0]?.identity_data || {};
              const fullName = metadata.full_name || metadata.name || identityData.full_name || identityData.name;
              const nameParts = (fullName || '').trim().split(' ');
              const googleFirstName = nameParts[0] || 'User';
              const googleLastName = nameParts.slice(1).join(' ') || '';

              // Hydrate context instantly so all screens show real name
              if (hydrateProfileData) {
                hydrateProfileData({ first_name: googleFirstName, last_name: googleLastName });
              }

              // Write to cache so subsequent app loads are instant
              await AsyncStorage.setItem('dialectgo_current_user_cache', JSON.stringify({
                first_name: googleFirstName,
                last_name: googleLastName,
                avatar_url: null,
              }));

              // ─── STEP 2: Sync Google name to backend (await with timeout) ───
              setGoogleLoadingMsg('Syncing your profile...');
              if (fullName) {
                try {
                  const syncPromise = fetch(endpoints.USER_PROFILE, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${params.access_token}`,
                    },
                    body: JSON.stringify({
                      firstName: googleFirstName,
                      lastName: googleLastName || '',
                    }),
                  });
                  const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Sync timeout')), 15000)
                  );
                  await Promise.race([syncPromise, timeoutPromise]);
                  console.log("[GoogleSync] Backend profile sync completed");
                } catch (syncErr) {
                  console.warn("[GoogleSync] Backend sync timed out or failed (non-fatal):", syncErr);
                }
              }
            }
          }

          setGoogleLoadingMsg('Almost there...');
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
      setGoogleLoading(false);
      setGoogleLoadingMsg('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Google Sign-In Loading Overlay */}
      {googleLoading && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(28, 36, 44, 0.85)', zIndex: 9999, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FFD54F" />
          <Text style={{ color: '#FFF', marginTop: 16, fontFamily: 'Poppins-Medium', fontSize: 16, textAlign: 'center' }}>
            {googleLoadingMsg || 'Setting up your account...'}
          </Text>
          <Text style={{ color: '#AAA', marginTop: 8, fontFamily: 'Poppins-Regular', fontSize: 13, textAlign: 'center', paddingHorizontal: 40 }}>
            This may take a moment on first sign-in
          </Text>
        </View>
      )}
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
                placeholder="juan@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: null }); }}
                onBlur={() => {
                  const em = email.trim();
                  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
                  if (em && !emailRegex.test(em)) {
                    setErrors(prev => ({ ...prev, email: "Please enter a valid Gmail address (e.g. user@gmail.com)" }));
                  }
                }}
              />
              {errors.email && errors.email !== ' ' && <Text style={{ color: '#FF4D4D', fontSize: 12, marginTop: 4, marginLeft: 10, fontWeight: 'bold' }}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Password</Text>
              <View style={[styles.bubbleInput, { flexDirection: 'row', alignItems: 'center', paddingRight: 15, paddingVertical: 0 }, errors.password ? { borderColor: '#FF4D4D', borderWidth: 1.5 } : null]}>
                <TextInput
                  style={{ flex: 1, paddingVertical: 16, color: '#000' }}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
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