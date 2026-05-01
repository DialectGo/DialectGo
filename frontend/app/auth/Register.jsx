import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../../shared/styles/LoginStyles';

const API_URL = 'http://192.168.1.52:5001/api/v1/users/register'; 

export default function SignUp({ onSwitch, onSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Address States
  const [country, setCountry] = useState('Philippines'); // Default value
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');

  // Date of Birth States
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
      setDateSelected(true);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName || !dateSelected || !province || !city) {
      Alert.alert("Error", "Palihug kumpletoha ang tanang fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          birthDate: birthDate.toISOString().split('T')[0],
          country,
          province,
          city,
          // addressLine: `${city}, ${province}, ${country}`,
          username: email.split('@')[0], 
          preferredLanguageCode: 'en'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        throw new Error(result.message || "Registration failed");
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
              Malipayong pag-abot! Palihug pag-log in gamit ang imong bag-ong credentials.
            </Text>
            
            <TouchableOpacity 
              style={[styles.bubblePrimaryBtn, { marginTop: 30, width: '100%' }]} 
              onPress={() => {
                setIsSuccess(false);
                onSwitch(); // Switches the form inside the sheet to Login
                // Optional: call onSuccess() here if you want to close the sheet entirely
              }}
            >
              <Text style={styles.primaryBtnText}>PROCEED TO LOGIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.loginCard}>
            <Text style={styles.cardLabel}>CREATE YOUR ACCOUNT</Text>

            {/* Name Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={[styles.inputGroup, { width: '48%' }]}>
                <Text style={styles.labelShadow}>First Name</Text>
                <TextInput style={styles.bubbleInput} placeholder="First" value={firstName} onChangeText={setFirstName} />
              </View>
              <View style={[styles.inputGroup, { width: '48%' }]}>
                <Text style={styles.labelShadow}>Last Name</Text>
                <TextInput style={styles.bubbleInput} placeholder="Last" value={lastName} onChangeText={setLastName} />
              </View>
            </View>

            {/* Birthdate */}
            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Birthdate</Text>
              <TouchableOpacity 
                style={[styles.bubbleInput, { justifyContent: 'center' }]} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: dateSelected ? '#000' : '#999' }}>
                  {dateSelected ? birthDate.toDateString() : "Select Birthdate"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={onChangeDate}
                />
              )}
            </View>

            {/* Country */}
            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Country</Text>
              <TextInput style={styles.bubbleInput} placeholder="Country" value={country} onChangeText={setCountry} />
            </View>

            {/* Province & City Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={[styles.inputGroup, { width: '48%' }]}>
                <Text style={styles.labelShadow}>Province</Text>
                <TextInput style={styles.bubbleInput} placeholder="Province" value={province} onChangeText={setProvince} />
              </View>
              <View style={[styles.inputGroup, { width: '48%' }]}>
                <Text style={styles.labelShadow}>City</Text>
                <TextInput style={styles.bubbleInput} placeholder="City" value={city} onChangeText={setCity} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Email</Text>
              <TextInput style={styles.bubbleInput} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelShadow}>Password</Text>
              <TextInput style={styles.bubbleInput} placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
            </View>

            <TouchableOpacity style={[styles.bubblePrimaryBtn, { marginTop: 20 }]} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>SIGN UP</Text>}
            </TouchableOpacity>

            <View style={[styles.footer, { marginTop: 20 }]}>
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