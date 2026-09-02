import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  ScrollView
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/shared/api/supabase';
import AuthLayout from './AuthLayout';
import AuthInput from '../../src/shared/components/AuthInput';
import CustomButton from '../../src/shared/components/CustomButton';
import { useLocalSearchParams } from 'expo-router';
import { PASSWORD_RESET_REDIRECT_URL } from '../../src/shared/api/client';
import forgotPassImg from '../../assets/beelogo/forgot_pass_screen.png';
import { useToast } from '../../src/shared/context/ToastContext';

export default function ForgotPassword() {
  const router = useRouter();
  const { email: initialEmail } = useLocalSearchParams();
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSendCode = async () => {
    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setError('');
    setLoading(true);
    Keyboard.dismiss();

    try {
      const { data, error: sbError } = await supabase.auth.resetPasswordForEmail(
        email.trim(), 
        {
          redirectTo: PASSWORD_RESET_REDIRECT_URL,
        }
      );

      if (sbError) {
        setError(sbError.message);
      } else {
        router.push({
          pathname: '/auth/VerifyEmail',
          params: { email: email.trim() }
        });
      }
    } catch (err) {
      console.error("Forgot Password Error:", err);
      showToast("An unexpected error occurred.", 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#FFFFFF' }} keyboardShouldPersistTaps="handled">
          <AuthLayout
            title="Forgot Password"
            description="Enter email address to receive a verification code."
            step={1}
            logoSource={forgotPassImg}
          >
            <View style={styles.formContainer}>
              <AuthInput 
                label="Enter your email address"
                value={email}
                onChangeText={(val) => {
                  setError('');
                  setEmail(val);
                }}
                keyboardType="email-address"
                style={error ? styles.errorInput : styles.authArea}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <CustomButton 
                title="Send" 
                onPress={handleSendCode} 
                loading={loading}
                style={styles.actionBtn}
              />
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
  authArea: {
    backgroundColor: '#FFECB3', // Based on the yellow input box in design
    borderRadius: 15,
    height: 60,       
  },
  errorInput: {
    backgroundColor: '#FFECB3',
    borderRadius: 15,
    height: 60,
    borderWidth: 1.5,
    borderColor: '#FF4D4D',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: -10
  },
  actionBtn: {
    backgroundColor: '#FFBC00',
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
    marginTop: 10,
  }
});