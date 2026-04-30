import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { styles } from '../../shared/styles/LoginStyles';
import { supabase } from '../../shared/lib/supabase';

export default function SignUp({ onSwitch }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState(''); // Added middle name
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName || !username) {
      Alert.alert("Error", "Palihug kumpletoha ang tanang fields."); 
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up sa Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert details sa 'profiles' table base sa iyong bagong query
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              middle_name: middleName, // Added
              username: username,
              email: email,
              address_line: address, // Inayos base sa schema mo (address_line)
              streak_count: 0,
              created_at: new Date(),
              // Default values para sa required fields na wala pa sa form:
              preferred_language_code: 'en', // Halimbawa: default to English
            },
          ]);

        if (profileError) throw profileError;

        // 3. FORCE SIGN OUT para dumaan sa Login Screen
        await supabase.auth.signOut();
        setIsSuccess(true);
      }
    } catch (error) {
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- SUCCESS MODAL --- */}
      <Modal visible={isSuccess} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFF', width: '100%', borderRadius: 30, padding: 30, alignItems: 'center' }}>
            <View style={{ backgroundColor: '#4CAF50', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#FFF', fontSize: 40 }}>✓</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>Account Registered!</Text>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 20 }}>
              Malipayong pag-abot! Ang imong account malampusong namugna. Palihug pag-log in gamit ang imong bag-ong credentials.
            </Text>
            <TouchableOpacity 
              style={[styles.bubblePrimaryBtn, { marginTop: 30, width: '100%' }]} 
              onPress={() => {
                setIsSuccess(false);
                onSwitch(); 
              }}
            >
              <Text style={styles.primaryBtnText}>PROCEED TO LOGIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerContainer}>
            <Image source={require('../../assets/logo/bee.png')} style={styles.miniLogo} resizeMode="contain" />
            <View style={styles.brandGroup}>
              <View style={styles.welcomeRow}>
                <Text style={styles.welcomeTextBold}>Himo og Account!</Text>
              </View>
            </View>
          </View>

          <View style={styles.loginCard}>
            <Text style={styles.cardLabel}>CREATE YOUR ACCOUNT</Text>

            {/* Name Section */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={[styles.inputGroup, { width: '48%' }]}>
                <Text style={styles.labelShadow}>First Name</Text>
                <TextInput 
                  style={styles.bubbleInput} 
                  placeholder="First" 
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={[styles.inputGroup, { width: '48%' }]}>
                <Text style={styles.labelShadow}>Last Name</Text>
                <TextInput 
                  style={styles.bubbleInput} 
                  placeholder="Last" 
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Address Line</Text>
              <TextInput 
                style={styles.bubbleInput} 
                placeholder="Enter your address" 
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Email</Text>
              <TextInput 
                style={styles.bubbleInput} 
                placeholder="email@example.com" 
                keyboardType="email-address" 
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Username</Text>
              <TextInput 
                style={styles.bubbleInput} 
                placeholder="Choose a username" 
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Password</Text>
              <TextInput 
                style={styles.bubbleInput} 
                placeholder="••••••••" 
                secureTextEntry 
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              style={[styles.bubblePrimaryBtn, { marginTop: 20 }]} 
              activeOpacity={0.8}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryBtnText}>SIGN UP</Text>
              )}
            </TouchableOpacity>

            <View style={[styles.footer, { marginTop: 30 }]}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={onSwitch}>
                <Text style={styles.footerLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}