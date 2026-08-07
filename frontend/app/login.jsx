import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../shared/styles/LoginStyles';
import { useRouter } from 'expo-router'; 
import { supabase } from '../shared/lib/supabase';
import { endpoints } from '../shared/config/apiConfig';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { FontAwesome5 } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

const LOGIN_URL = endpoints.USER_LOGIN;

export default function LogIn({ onSwitch, onSuccess }) {
  const router = useRouter(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LOGIN LOGIC ---
  const handleLogin = async (email, password) => {
    if (!email || !password) {
      Alert.alert("Error", "Palihug isulod ang imong email ug password.");
      return;
    }

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

        if (onSuccess) {
          onSuccess();
        } else {
          // Replace '/(tabs)' with whatever your home/dashboard route is
          router.replace('../(tabs)/Home'); 
        }

        return response.data;

      } catch (error) {
        console.error("Login Error:", error);
        Alert.alert("Error", error.response?.data?.message || error.message || 'Login failed');
      } finally {
        setLoading(false); 
      }
    };

  const handleOAuthLogin = async (provider) => {
    if (loading) return;
    setLoading(true);
    try {
      const redirectUrl = makeRedirectUri();
      console.log("Generated Redirect URL:", redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
      
      console.log("Supabase OAuth URL:", data?.url);

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success' && result.url) {
          const url = result.url;
          
          const accessTokenMatch = url.match(/access_token=([^&]+)/);
          const refreshTokenMatch = url.match(/refresh_token=([^&]+)/);
          
          if (accessTokenMatch && refreshTokenMatch) {
             const access_token = accessTokenMatch[1];
             const refresh_token = refreshTokenMatch[1];
             
             const { error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token,
             });
             
             if (sessionError) throw sessionError;
             
             await AsyncStorage.removeItem('@guest_mode');
             await AsyncStorage.setItem('@user_role', 'authenticated');
             if (onSuccess) {
                onSuccess();
             } else {
                router.replace('../(tabs)/Home'); 
             }
          } else {
            // If Supabase natively parsed the URL via a deep link listener, session might already be set.
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              await AsyncStorage.removeItem('@guest_mode');
              await AsyncStorage.setItem('@user_role', 'authenticated');
              if (onSuccess) onSuccess();
              else router.replace('../(tabs)/Home'); 
            }
          }
        }
      }
    } catch (error) {
      console.error("OAuth Error:", error);
      Alert.alert("OAuth Error", error.message || 'Authentication failed');
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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* --- HEADER --- */}
          <View style={styles.headerContainer}>
            <Image 
              source={require('../assets/logo/bee.png')}
              style={styles.miniLogo} 
              resizeMode="contain" 
            />
            <View style={styles.brandGroup}>
              <View style={styles.welcomeRow}>
                <Text style={styles.welcomeTextBold}>Maayong</Text>
                <Text style={styles.welcomeTextBold}> Pagbalik!</Text>
              </View>
            </View>
          </View>

          {/* --- WHITE BUBBLE CARD --- */}
          <View style={styles.loginCard}>
            
            <Text style={styles.cardLabel}>LOGIN TO YOUR ACCOUNT</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Email</Text>
              <TextInput 
                style={styles.bubbleInput} 
                placeholder="Enter your email" 
                placeholderTextColor="#BDBDBD" 
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Password</Text>
              <TextInput 
                style={styles.bubbleInput} 
                placeholder="••••••••" 
                placeholderTextColor="#BDBDBD" 
                secureTextEntry 
                value={password}
                onChangeText={setPassword}
              />
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

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.bubbleSocialBtn} onPress={() => handleOAuthLogin('google')} disabled={loading}>
                <FontAwesome5 name="google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bubbleSocialBtn} onPress={() => handleOAuthLogin('facebook')} disabled={loading}>
                <FontAwesome5 name="facebook" size={20} color="#4267B2" style={{ marginRight: 10 }} />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <TouchableOpacity 
                  onPress={() => {
                    // Directs the user to app/auth/Register.jsx
                    router.push('../auth/Register'); 
                  }}>
                <Text style={styles.footerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}