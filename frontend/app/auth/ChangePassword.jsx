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
import ConfirmOverlay from '../../src/shared/components/ConfirmOverlay';
import newPassImg from '../../assets/beelogo/new_pass_screen.png';
import { useToast } from '../../src/shared/context/ToastContext';

export default function ChangePassword() {
  const router = useRouter();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { showToast } = useToast();

  const handleChangePassword = async () => {
    setError('');
    Keyboard.dismiss();

    if (!form.password || form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);

    const { error: sbError } = await supabase.auth.updateUser({
      password: form.password,
    });

    setLoading(false);

    if (sbError) {
      showToast(sbError.message, 'error', 'Error');
    } else {
      setShowSuccessModal(true);
    }
  };

  const handleSuccessClose = async () => {
    setShowSuccessModal(false);
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#FFFFFF' }} keyboardShouldPersistTaps="handled">
          <AuthLayout
            title="Create New Password"
            description="Your new password must be different from your previous password."
            step={3}
            logoSource={newPassImg}
          >
            <View style={styles.formContainer}>
              <AuthInput 
                label="Enter your new password"
                onChangeText={(v) => {
                  setError('');
                  setForm({...form, password: v});
                }}
                secureTextEntry
                style={error ? styles.errorInput : styles.authArea}
              />
              
              <AuthInput 
                label="Confirm your new password"
                onChangeText={(v) => {
                  setError('');
                  setForm({...form, confirmPassword: v});
                }}
                secureTextEntry
                style={error ? styles.errorInput : styles.authArea}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <CustomButton 
                title="Confirm Change" 
                onPress={handleChangePassword} 
                loading={loading}
                style={styles.actionBtn}
              />
            </View>
          </AuthLayout>

          <ConfirmOverlay
            visible={showSuccessModal}
            title="Success"
            message="Password changed successfully. Please log in."
            confirmText="OK"
            type="success"
            hideCancel={true}
            onConfirm={handleSuccessClose}
          />

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
    backgroundColor: '#FFE5E5',
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