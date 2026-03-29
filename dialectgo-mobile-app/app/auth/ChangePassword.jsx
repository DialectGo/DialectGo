import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '../../shared/lib/supabase';
import AuthLayout from './AuthLayout';
import AuthInput from '../../shared/components/AuthInput';
import CustomButton from '../../shared/components/CustomButton';

export default function ChangePassword() {
  const router = useRouter();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');
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
      Alert.alert("Error", sbError.message);
    } else {
      Alert.alert("Success", "Password changed successfully. Please log in.");
      await supabase.auth.signOut();
      router.replace('/login');
    }
  };

  return (
    <AuthLayout
      title="Create Pass"
      description="Your new password must be different from your previous password."
      step={3}
    >
      <View className="space-y-4">
        <AuthInput 
          label="Enter your new password"
          onChangeText={(v) => setForm({...form, password: v})}
          secureTextEntry
          style={error ? styles.errorInput : styles.authArea}
        />
        
        <AuthInput 
          label="Confirm your new password"
          onChangeText={(v) => setForm({...form, confirmPassword: v})}
          secureTextEntry
          style={error ? styles.errorInput : styles.authArea}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <CustomButton 
          title="Confirm Change" 
          onPress={handleChangePassword} 
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
    marginTop: -10
  },
  actionBtn: {
    backgroundColor: '#FFBC00',
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
    marginTop: 20,
  }
});