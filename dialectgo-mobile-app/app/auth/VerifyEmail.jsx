import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../shared/lib/supabase';
import AuthLayout from './AuthLayout';
import AuthInput from '../../shared/components/AuthInput';
import CustomButton from '../../shared/components/CustomButton';

const OTP_LENGTH = 8; 

export default function VerifyEmail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [countdown, setCountdown] = useState(120); 

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

    const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
        // Supabase V1 Syntax: verifyOtp(email, token, options)
        const { error: sbError, session } = await supabase.auth.verifyOtp(
        params.email, 
        token, 
        { type: 'recovery' }
        );

        if (sbError) {
        setError(sbError.message);
        } else {
        // If successful, V1 automatically sets the session
        router.push('/auth/ChangePassword');
        }
    } catch (err) {
        setError("Verification failed. Please try again.");
    } finally {
        setLoading(false);
    }
    };

  const maskEmail = (email) => {
    if (!email) return 'your email';
    const [name, domain] = email.split('@');
    return `${name[0]}******@${domain}`;
  };

  const handleResendCode = async () => {
    Alert.alert("Resend Code", "Not implemented yet.");
  };

  return (
    <AuthLayout
      title="Verify Email"
      description={`Enter the ${OTP_LENGTH} digits code sent to your email address \n${maskEmail(params.email)} below.`}
      step={2}
    >
      <View className="space-y-6">
        <View style={styles.otpContainer}>
          <AuthInput 
            label="Verification Code"
            onChangeText={setToken}
            keyboardType="numeric"
            maxLength={OTP_LENGTH}
            style={error ? styles.errorInput : styles.authArea}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {countdown > 0 ? (
          <Text style={styles.expireText}>Code expires in {countdown}s</Text>
        ) : (
          <Text style={styles.expireText}>Code has expired.</Text>
        )}

        <CustomButton 
          title="Verify" 
          onPress={handleVerify} 
          loading={loading}
          style={styles.actionBtn}
        />

        <View className="flex-row items-center justify-center pt-2">
            <Text className="text-slate-600">Didn’t get the code? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={countdown > 0}>
                <Text className={`font-black underline ${countdown > 0 ? 'text-slate-400' : 'text-amber-400'}`}>Resend code.</Text>
            </TouchableOpacity>
        </View>
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
    marginTop: -15
  },
  expireText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -10
  },
  actionBtn: {
    backgroundColor: '#FFBC00',
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
  }
});