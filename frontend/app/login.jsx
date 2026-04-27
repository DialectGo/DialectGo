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
import { supabase } from '../shared/lib/supabase';

export default function LogIn({ onSwitch, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LOGIN LOGIC ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Palihug isulod ang imong email ug password."); // Please enter email and password
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // Mas specific na error messages
        let msg = error.message;
        if (msg === "Invalid login credentials") msg = "Sayop ang email o password.";
        throw new Error(msg);
      }

      // Success! Dahil may listener tayo sa App.js, 
      // automatic na mag-uupdate ang screen doon.
      if (onSuccess) onSuccess();
      
    } catch (error) {
      Alert.alert("Login Failed", error.message);
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

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.bubblePrimaryBtn} 
              activeOpacity={0.8}
              onPress={handleLogin}
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