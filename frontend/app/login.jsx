import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../shared/styles/LoginStyles';
import { useRouter } from 'expo-router'; 
import { supabase } from '../shared/lib/supabase';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.53:5001/api/v1/users';

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
        const response = await axios.post(`${API_BASE_URL}/login`, {
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

        if (onSuccess) {
          onSuccess();
        } else {
          // Replace '/(tabs)' with whatever your home/dashboard route is
          router.replace('../(tabs)'); 
        }

        return response.data;

      } catch (error) {
        console.error("Login Error:", error);
        Alert.alert("Error", error.response?.data?.message || error.message || 'Login failed');
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
              <TouchableOpacity style={styles.bubbleSocialBtn} activeOpacity={0.7}>
                <Image 
                  source={require('../assets/logo/googleLogo.png')}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.bubbleSocialBtn} activeOpacity={0.7}>
                <Image 
                  source={require('../assets/logo/facebookLogo.jpg')}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <TouchableOpacity onPress={onSwitch}>
                <Text style={styles.footerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}