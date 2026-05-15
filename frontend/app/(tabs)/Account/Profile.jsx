import React, { useEffect, useState } from 'react';
import { 
  Image, 
  ScrollView, 
  StatusBar, 
  Text, 
  TouchableOpacity, 
  View, 
  SafeAreaView, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../shared/lib/supabase';
import ProfileTopBar from '../../../shared/components/ProfileTopBar';
import BottomNav from '../../../shared/components/BottomNav';
import FeatureGateModal from '../../../shared/components/FeatureGateModal'; // Imported Gate
import { styles } from '../../../shared/styles/ProfileStyles';

const availableAvatars = [
  { id: 1, name: 'maria_clara.png', source: require('../../../assets/avatars/maria_clara.png') },
  { id: 2, name: '1.png', source: require('../../../assets/avatars/1.png') },
  { id: 3, name: '2.png', source: require('../../../assets/avatars/2.png') },
  { id: 4, name: '3.png', source: require('../../../assets/avatars/3.png') },
  { id: 5, name: '4.png', source: require('../../../assets/avatars/4.png') },
];

const PROFILE_API = 'http://192.168.1.53:5001/api/v1/users/profile';
const STREAK_API = 'http://192.168.1.53:5001/api/v1/users/streak';

export default function Profile({ onNavigate }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [gateVisible, setGateVisible] = useState(false); // Modal visibility control

  // Profile States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userAvatar, setUserAvatar] = useState(availableAvatars[0].source);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      const role = await AsyncStorage.getItem('@user_role');
      
      if (role === 'guest') {
        setIsGuest(true);
        setFirstName('Guest');
        setLastName('User');
        setStreakCount(0);
        setUserAvatar(availableAvatars[0].source); // Default guest fallback icon
      } else {
        setIsGuest(false);
        await Promise.all([
          fetchUserProfile(),
          fetchStreak()
        ]);
      }
      setLoading(false);
    };
    loadProfileData();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(PROFILE_API, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        const user = result.data;
        setFirstName(user.first_name || 'User');
        setLastName(user.last_name || '');
        
        if (user.profile_avatar_url) {
          const matched = availableAvatars.find(a => a.name === user.profile_avatar_url);
          if (matched) setUserAvatar(matched.source);
        }
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
    }
  };

  const fetchStreak = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(STREAK_API, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      if (result.success) setStreakCount(result.data.streak);
    } catch (error) {
      console.error("Profile Streak Fetch Error:", error);
    }
  };

  // Safe layout intercept handling method
  const handleProtectedAction = (targetPath) => {
    if (isGuest) {
      setGateVisible(true);
    } else {
      router.push(targetPath);
    }
  };

  const handleLogout = async () => {
    // Clear locally stored authentication state flags cleanly on exit
    await AsyncStorage.multiRemove(['@user_token', '@user_role', '@user_metadata']);
    if (onNavigate) {
      onNavigate('auth');
    } else {
      router.replace('/auth/AuthTransition');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#FFD54F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />

      <ProfileTopBar title="Profile" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image source={userAvatar} style={styles.avatarImg} />
          </View>
          <Text style={styles.userName}>{`${firstName} ${lastName}`.trim()}</Text>
          <Text style={styles.streakText}>
            {isGuest ? 'Sign in to accumulate streaks' : `${streakCount} days streak`}
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          {/* Gated Feature */}
          <TouchableOpacity style={styles.menuItem} onPress={() => handleProtectedAction('/Account/AccountInformation')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/profileIcon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Account Information</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          {/* Gated Feature */}
          <TouchableOpacity style={styles.menuItem} onPress={() => handleProtectedAction('/Account/Streaks')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/fireIcon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Streaks</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Account/Settings')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/settings_icon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Settings</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Account/About')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/info_icon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>About DialectGo</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/logout_icon.png')} style={styles.logoutIcon} />
              <Text style={styles.logoutText}>{isGuest ? 'Exit Guest Mode' : 'Log out'}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={{ height: 50 }} />
        </View>
      </ScrollView>

      {/* Global Gating Component Anchor */}
      <FeatureGateModal visible={gateVisible} onClose={() => setGateVisible(false)} />

      <BottomNav activeTab="Profile" />
    </SafeAreaView>
  );
}