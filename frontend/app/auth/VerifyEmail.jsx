import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  ScrollView,
  TextInput
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/shared/api/supabase';
import AuthLayout from './AuthLayout';
import CustomButton from '../../src/shared/components/CustomButton';
import { maskEmail } from '../../src/shared/utils/stringUtils';
import verifyEmailImg from '../../assets/beelogo/verify_email_screen.png';

// Supabase standard OTP can be up to 8 digits
const OTP_LENGTH = 8; 

export default function VerifyEmail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(120); 
  
  const inputRef = useRef(null);

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

  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < OTP_LENGTH; i++) {
      const char = token[i] || '';
      const isFocused = token.length === i;
      
      boxes.push(
        <View 
          key={i} 
          style={[
            styles.otpBox, 
            isFocused && styles.otpBoxFocused,
            error && styles.otpBoxError
          ]}
        >
          <Text style={styles.otpText}>{char}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, backgroundColor: '#FFFFFF' }} 
          keyboardShouldPersistTaps="handled"
        >
          <AuthLayout
            title="Verify Email"
            description={`Enter the ${OTP_LENGTH} digits code sent to your email address \n${maskEmail(params.email)} below.`}
            step={2}
            logoSource={verifyEmailImg}
          >
            <View style={styles.formContainer}>
              
              <TouchableOpacity 
                activeOpacity={1} 
                onPress={() => inputRef.current?.focus()}
                style={styles.otpBoxesContainer}
              >
                {renderOtpBoxes()}
              </TouchableOpacity>

              {/* Hidden actual input */}
              <TextInput
                ref={inputRef}
                value={token}
                onChangeText={(val) => {
                  setError('');
                  // Only allow digits up to OTP_LENGTH
                  setToken(val.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH));
                }}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                style={styles.hiddenInput}
                autoFocus
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Text style={styles.expireText}>
                {countdown > 0 ? `Code expires in ${countdown}s` : "The verification code you entered has expired."}
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
                        Resend code
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
    marginTop: 10,
    gap: 15,
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4, 
    paddingHorizontal: 2,
    marginBottom: 5,
  },
  otpBox: {
    width: 34, 
    height: 46,
    backgroundColor: '#FFECB3', 
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  otpBoxFocused: {
    borderColor: '#FFBC00', 
  },
  otpBoxError: {
    borderColor: '#FF4D4D',
  },
  otpText: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#333',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: -5
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
    paddingTop: 5,
  },
  footerText: {
    color: '#9CA3AF',
    fontWeight: 'bold'
  },
  resendLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  }
});