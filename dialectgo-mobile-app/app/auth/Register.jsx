import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Checkbox } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../shared/lib/supabase'; 
import AuthInput from '../../shared/components/AuthInput';
import SocialAuth from '../../shared/components/SocialAuth';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!agree) return Alert.alert("Required", "Please agree to the Terms & Conditions");
    if (form.password !== form.confirmPassword) return Alert.alert("Error", "Passwords do not match");
    if (form.password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters");
    
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Sign Up Error", error.message);
    } else {
      Alert.alert("Success", "Account created! Please check your email for confirmation.");
      router.replace('/login');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Maayong Pagabot!</Text>
        <Text variant="bodySmall" style={styles.headerSub}>Translate Cebuano, Connect Everywhere.</Text>
      </View>

      <View style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text variant="headlineLarge" style={styles.title}>SIGN UP</Text>
          
          <AuthInput label="Email" keyboardType="email-address" 
            onChangeText={(v) => setForm({...form, email: v})} />
          
          <AuthInput label="Password" secureTextEntry 
            onChangeText={(v) => setForm({...form, password: v})} />
          
          <AuthInput label="Confirm Password" secureTextEntry 
            onChangeText={(v) => setForm({...form, confirmPassword: v})} />

          <View style={styles.checkboxRow}>
            <Checkbox status={agree ? 'checked' : 'unchecked'} onPress={() => setAgree(!agree)} color="#FBBF24" />
            <Text style={styles.checkboxLabel}>I agree to the <Text style={styles.boldUnderline}>Terms and Conditions</Text></Text>
          </View>

          <Button mode="contained" loading={loading} onPress={handleSignUp}
            buttonColor="#F2F2F2" textColor="#000" style={styles.submitBtn}>
            SIGN UP
          </Button>

          <SocialAuth />

          <View style={styles.footerRow}>
            <Text>Already have an account?</Text>
            <Button mode="text" compact textColor="#000" onPress={() => router.push('/login')}>Log In</Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBBF24' },
  headerContainer: { paddingHorizontal: 30, paddingTop: 40, paddingBottom: 50 },
  headerTitle: { fontWeight: 'bold', color: '#1e293b' },
  headerSub: { color: '#334155' },
  formContainer: { flex: 1, backgroundColor: '#D9D9D9', borderTopLeftRadius: 45, borderTopRightRadius: 45, shadowOpacity: 0.1 },
  scrollContent: { padding: 30 },
  title: { textAlign: 'center', fontWeight: 'bold', marginBottom: 30, color: '#1e293b' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkboxLabel: { color: '#1e293b', fontSize: 14 },
  boldUnderline: { fontWeight: 'bold', textDecorationLine: 'underline' },
  submitBtn: { borderRadius: 10, paddingVertical: 5, marginTop: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
});