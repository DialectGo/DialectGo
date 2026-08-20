import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  ScrollView 
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/shared/api/supabase';
import AuthLayout from './AuthLayout';
import AuthInput from '../../src/shared/components/AuthInput';
import CustomButton from '../../src/shared/components/CustomButton';
import { maskEmail } from '../../src/shared/utils/stringUtils';

// Supabase standard OTP is 6 digits. 
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
    if (token.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code`);
      return;
    }

    setError('');
    setLoading(true);
    Keyboard.dismiss(); // Close keyboard on submit

    try {
      const { data, error: sbError } = await supabase.auth.verifyOtp({
        email: params.email,
        token: token,
        type: 'recovery', // Correct for Forgot Password flow
      });

      if (sbError) {
        setError(sbError.message);
      } else {
        router.push('/auth/ChangePassword');
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };


  const handleResendCode = async () => {
    setLoading(true);
    const { error: resendError } = await supabase.auth.resetPasswordForEmail(params.email);
    setLoading(false);

    if (resendError) {
      Alert.alert("Error", resendError.message);
    } else {
      setCountdown(120);
      Alert.alert("Success", "A new code has been sent to your email.");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          keyboardShouldPersistTaps="handled"
        >
          <AuthLayout
            title="Verify Email"
            description={`Enter the ${OTP_LENGTH} digits code sent to your email address \n${maskEmail(params.email)} below.`}
            step={2}
          >
            <View style={styles.formContainer}>
              <View style={styles.otpContainer}>
                <AuthInput 
                  label="Verification Code"
                  value={token}
                  onChangeText={(val) => {
                    setError('');
                    setToken(val);
                  }}
                  keyboardType="number-pad" // Better for mobile keyboards
                  maxLength={OTP_LENGTH}
                  style={error ? styles.errorInput : styles.authArea}
                  placeholder="00000000"
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Text style={styles.expireText}>
                {countdown > 0 ? `Code expires in ${countdown}s` : "Code has expired."}
              </Text>

              <CustomButton 
                title="Verify" 
                onPress={handleVerify} 
                loading={loading}
                style={[styles.actionBtn, { opacity: token.length === OTP_LENGTH ? 1 : 0.7 }]}
                disabled={token.length !== OTP_LENGTH || loading}
              />

              <View style={styles.footer}>
                  <Text style={styles.footerText}>Didn’t get the code? </Text>
                  <TouchableOpacity onPress={handleResendCode} disabled={countdown > 0 || loading}>
                      <Text style={[
                        styles.resendLink, 
                        { color: countdown > 0 ? '#9CA3AF' : '#FFBC00' }
                      ]}>
                        Resend code.
                      </Text>
                  </TouchableOpacity>
              </View>
            </View>
          </AuthLayout>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 20,
    gap: 20,
  },
  authArea: {
    backgroundColor: '#ffffff',
    borderRadius: 35,
    height: 65,       
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontWeight: '600',
    textAlign: 'center',
    marginTop: -10
  },
  expireText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionBtn: {
    backgroundColor: '#FFBC00',
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  footerText: {
    color: '#475569',
  },
  resendLink: {
    fontWeight: '900',
    textDecorationLine: 'underline',
  }
});