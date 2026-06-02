import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '../../shared/lib/supabase';
import AuthLayout from './AuthLayout';
import AuthInput from '../../shared/components/AuthInput';
import CustomButton from '../../shared/components/CustomButton';
import { useLocalSearchParams } from 'expo-router';
import { PASSWORD_RESET_REDIRECT_URL } from '../../shared/config/apiConfig';

export default function ForgotPassword() {
  const router = useRouter();
  const { email: initialEmail } = useLocalSearchParams();
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    setLoading(true);

    try {
      // FIX: Remove '.api' from the call
      const { data, error: sbError } = await supabase.auth.resetPasswordForEmail(
        email.trim(), 
        {
          // Ensure this URL is added to your Supabase Redirect URLs in the dashboard
          redirectTo: PASSWORD_RESET_REDIRECT_URL,
        }
      );

      if (sbError) {
        Alert.alert("Error", sbError.message);
      } else {
        router.push({
          pathname: '/auth/VerifyEmail',
          params: { email: email.trim() }
        });
      }
    } catch (err) {
      console.error("Forgot Password Error:", err);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter email address to receive a verification code."
      step={1}
    >
      <View className="space-y-6">
        <AuthInput 
          label="Email Address"
          onChangeText={setEmail}
          keyboardType="email-address"
          style={error ? styles.errorInput : styles.authArea}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}

        <CustomButton 
          title="Send" 
          onPress={handleSendCode} 
          loading={loading}
          style={styles.actionBtn}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  authArea: {
    backgroundColor: '#ffffff',
    borderRadius: 35,
    height: 65,       
    elevation: 5,
  },
  errorInput: {
    backgroundColor: '#ffffff',
    borderRadius: 35,
    height: 65,
    borderWidth: 1.5,
    borderColor: '#FF4D4D',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: -20
  },
  actionBtn: {
    backgroundColor: '#FFBC00',
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
  }
});