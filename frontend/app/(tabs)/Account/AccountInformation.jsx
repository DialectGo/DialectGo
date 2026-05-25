import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView
} from 'react-native';
import { styles } from '../../../shared/styles/AccountInformationStyles';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Assuming you use this for token
import { supabase } from '../../../shared/lib/supabase';
import ProfileTopBar from '../../../shared/components/ProfileTopBar';

const API_BASE_URL = 'http://192.168.1.15:5001/api/v1/users/profile';

// Listahan ng iyong available avatars
const availableAvatars = [
  { id: 1, name: 'maria_clara.png', source: require('../../../assets/avatars/maria_clara.png') },
  { id: 2, name: '1.png', source: require('../../../assets/avatars/1.png') },
  { id: 3, name: '2.png', source: require('../../../assets/avatars/2.png') },
  { id: 4, name: '3.png', source: require('../../../assets/avatars/3.png') },
  { id: 5, name: '4.png', source: require('../../../assets/avatars/4.png') },
];

export default function AccountInformation() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // FORM STATES
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(''); // Combined display string

  // AVATAR STATES
  const [currentAvatar, setCurrentAvatar] = useState(availableAvatars[0]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 1. FETCH PROFILE DATA ON MOUNT
  useEffect(() => {
    fetchProfile();
  }, []);

const fetchProfile = async () => {
    try {
      // 1. Give Supabase a moment to initialize storage (optional but helpful)
      // await new Promise(resolve => setTimeout(resolve, 500)); 

      const { data, error: sessionError } = await supabase.auth.getSession();
      
      // DEBUG: Let's see what is actually happening
      console.log("Session Data:", data.session);
      console.log("Session Error:", sessionError);

      if (sessionError || !data.session) {
          // If session is null, try to refresh it once
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (!refreshData.session) {
            Alert.alert("Authentication Required", "Please log in again.");
            setLoading(false);
            return;
          }
          // If refresh worked, use that session
          var session = refreshData.session;
      } else {
          var session = data.session;
      }

      // 2. Make the fetch call
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        const user = result.data;
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setBirthDate(user.birth_date || '');
        setEmail(user.email || '');
        
        const addr = [user.country, user.province, user.city].filter(Boolean).join(', ');
        setAddress(addr);

        if (user.profile_avatar_url) {
          const matched = availableAvatars.find(a => a.name === user.profile_avatar_url);
          if (matched) setCurrentAvatar(matched);
        }
      } else {
        Alert.alert("Error", result.message || "Failed to load profile.");
      }
    } catch (error) {
      console.error("Fetch Profile Error:", error);
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // 2. SAVE LOGIC
  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
          Alert.alert("Authentication Required", "Please log in.");
          setLoading(false);
          return;
      }
      
      // Parse address back into components if user edited the single string
      const [country, province, city] = address.split(',').map(s => s.trim());

      const response = await fetch(API_BASE_URL, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          birthDate,
          country,
          province,
          city,
          profile_avatar_url: currentAvatar.name // Saving the filename string
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Information updated!", [{ text: "OK", onPress: () => router.back() }]);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatarObj) => {
    setCurrentAvatar(avatarObj);
    setIsModalVisible(false);
  };

  if (loading) return <ActivityIndicator size="large" color="#FFD54F" style={{flex:1}} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      
      <ProfileTopBar title="Account Information" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* AVATAR SECTION - Replaceable */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image source={currentAvatar.source} style={styles.avatarImg} />
            <TouchableOpacity 
              style={styles.editBadge} 
              onPress={() => setIsModalVisible(true)}
            >
              <Image 
                source={require('../../../assets/icons/edit_icon.png')} 
                style={styles.editIcon} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.changeText}>Tap to change avatar</Text>
        </View>

        {/* FORM SECTION - Yellow Rounded Container */}
        <View style={styles.settingsContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>First Name</Text>
            <TextInput 
              style={styles.textInput} 
              value={firstName} 
              onChangeText={setFirstName} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            <TextInput 
              style={styles.textInput} 
              value={lastName} 
              onChangeText={setLastName} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Birth Date</Text>
            <TextInput 
              style={styles.textInput} 
              value={birthDate} 
              onChangeText={setBirthDate} 
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Address (Country, Province, City)</Text>
            <TextInput 
              style={styles.textInput} 
              value={address} 
              onChangeText={setAddress} 
              placeholder="Philippines, Laguna, Calamba"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput 
              style={styles.textInput} 
              value={email} 
              editable={false}
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: '#424242', marginBottom: 10 }]} 
            onPress={() => {
              router.push({
                  pathname: '/auth/ForgotPassword', // Absolute path from the app root
                  params: { email }
                });
            }}
          >
            <Text style={styles.saveBtnText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
          
          <View style={{ height: 50 }} />
        </View>
      </ScrollView>

      {/* AVATAR SELECTION MODAL */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Avatar</Text>
            <View style={styles.avatarGrid}>
              {availableAvatars.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => handleAvatarSelect(item)}
                  style={[
                    styles.avatarOption,
                    currentAvatar.id === item.id && styles.activeAvatarOption
                  ]}
                >
                  <Image source={item.source} style={styles.modalAvatarImg} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}