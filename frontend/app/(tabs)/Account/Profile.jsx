import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../../shared/lib/supabase';

// --- Sub-components ---

function ProfileHeader({ name, onBack, isEdit = false, title = "Profile" }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function AvatarDisplay({ uri, onEdit }) {
  return (
    <View style={styles.avatarContainer}>
      <View style={styles.avatarWrapper}>
        <Image source={uri} style={styles.avatarImage} />
        {onEdit && (
          <TouchableOpacity style={styles.editBadge} onPress={onEdit}>
            <Ionicons name="pencil" size={14} color="black" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function MenuButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={22} color="black" />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );
}

function InputField({ label, value, onChangeText, keyboardType = "default" }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}

// --- Main Export ---

export default function Profile() {
  const router = useRouter();
  const [view, setView] = useState('view');
  const [loading, setLoading] = useState(true); // New: Loading state
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    avatar: require('../../../assets/avatars/1.png'), // Default
    avatarId: 1 // Helper to track which index we are using
  });

  const avatars = [
    require('../../../assets/avatars/1.png'),
    require('../../../assets/avatars/2.png'),
    require('../../../assets/avatars/3.png'),
    require('../../../assets/avatars/5.png'),
  ];

  // --- APPLY useEffect HERE ---
  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://192.168.1.43:5001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          age: userData.age,
          avatar: userData.avatarId.toString(), // Store index as string
        }),
      });

      if (response.ok) {
        // Refresh the local data to be sure and go back to view mode
        await fetchProfileData(); 
        setView('view');
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  const fetchProfileData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://192.168.1.43:5001/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setUserData({
          firstName: result.firstName || '',
          lastName: result.lastName || '',
          age: result.age || '',
          email: result.email || '',
          // Use result.avatar (e.g., "2") to pick from local array
          avatar: avatars[parseInt(result.avatar) - 1] || avatars[0],
          avatarId: parseInt(result.avatar) || 1
        });
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (view === 'view') router.back();
    else setView('view');
  };

  // 1. MAIN PROFILE VIEW
  if (view === 'view') {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileHeader title="Profile" onBack={handleBack} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AvatarDisplay uri={userData.avatar} />
          <Text style={styles.profileName}>{userData.firstName}</Text>
          
          <View style={styles.menuContainer}>
            <MenuButton icon="person-outline" label="Account Information" onPress={() => setView('edit')} />
            <MenuButton icon="lock-closed-outline" label="Change Password" onPress={() => {}} />
            <View style={styles.emptySlot} />
            <View style={styles.emptySlot} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. EDIT ACCOUNT INFO VIEW
  if (view === 'edit') {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileHeader title="Account Information" onBack={handleBack} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AvatarDisplay uri={userData.avatar} onEdit={() => setView('avatar')} />
          
          <View style={styles.formContainer}>
            <InputField 
              label="First Name" 
              value={userData.firstName} 
              onChangeText={(text) => setUserData({ ...userData, firstName: text })} 
            />
            <InputField 
              label="Last Name" 
              value={userData.lastName} 
              onChangeText={(text) => setUserData({ ...userData, lastName: text })} 
            />
            <InputField 
              label="Age" 
              value={userData.age} 
              keyboardType="numeric" 
              onChangeText={(text) => setUserData({ ...userData, age: text })} 
            />
            {/* Email is typically read-only; if you want to edit it, add onChangeText here too */}
            <InputField 
              label="Email" 
              value={userData.email} 
              keyboardType="email-address" 
            />
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
            <Text style={styles.primaryBtnText}>Save Information</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 3. CHOOSE AVATAR VIEW
  if (view === 'avatar') {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileHeader title="Avatar" onBack={handleBack} />
        <View style={styles.avatarSelectionContainer}>
          <AvatarDisplay uri={userData.avatar} />
          <Text style={styles.selectionTitle}>Select your avatar</Text>
          
          <View style={styles.avatarGrid}>
            {avatars.map((img, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.gridItem}
                onPress={() => setUserData({...userData, avatar: img})}
              >
                <Image source={img} style={styles.gridImage} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setView('edit')}>
            <Text style={styles.primaryBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    backgroundColor: '#FBBF24', 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    left: 20,
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 10,
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  scrollContent: { paddingHorizontal: 25, alignItems: 'center', paddingBottom: 40 },

  // Avatar UI
  avatarContainer: { marginTop: 30, marginBottom: 15 },
  avatarWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FDE68A',
    padding: 5,
    borderWidth: 2,
    borderColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 75 },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000'
  },
  profileName: { fontSize: 24, fontWeight: '900', color: '#1F2937', marginBottom: 30 },

  // Menu List
  menuContainer: { width: '100%', gap: 12 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FBBF24',
    padding: 18,
    borderRadius: 15,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  menuLabel: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  emptySlot: { height: 50, backgroundColor: '#FEF3C7', borderRadius: 15, opacity: 0.5 },

  // Form UI
  formContainer: { width: '100%', marginTop: 10 },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#FBBF24', marginBottom: 5 },
  textInput: {
    backgroundColor: '#FFFBEB',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    fontSize: 14,
    color: '#374151'
  },

  // Avatar Grid
  avatarSelectionContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 30 },
  selectionTitle: { fontSize: 22, fontWeight: '900', color: '#FBBF24', marginVertical: 20 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginBottom: 40 },
  gridItem: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FDE68A'
  },
  gridImage: { width: '100%', height: '100%', borderRadius: 40 },

  // Button
  primaryBtn: {
    backgroundColor: '#FBBF24',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 20,
    width: '100%',
    alignItems: 'center'
  },
  primaryBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});