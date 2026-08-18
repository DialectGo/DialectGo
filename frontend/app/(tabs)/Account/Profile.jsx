import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react';
import { 
  Image, 
  StatusBar, 
  Text, 
  TouchableOpacity, 
  View, 
   
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../shared/lib/supabase';
import ProfileTopBar from '../../../shared/components/ProfileTopBar';
import BottomNav from '../../../shared/components/BottomNav';
import { Ionicons } from '@expo/vector-icons';
import FeatureGateModal from '../../../shared/components/FeatureGateModal'; 
import RefreshContainer from '../../../shared/components/RefreshContainer'; // ✅ Imported RefreshContainer
import { styles } from '../../../shared/styles/ProfileStyles';
import NetInfo from '@react-native-community/netinfo';
import { endpoints } from '../../../shared/config/apiConfig';

const availableAvatars = [
  { id: 1, name: 'maria_clara.png', source: require('../../../assets/avatars/maria_clara.png') },
  { id: 2, name: '1.png', source: require('../../../assets/avatars/1.png') },
  { id: 3, name: '2.png', source: require('../../../assets/avatars/2.png') },
  { id: 4, name: '3.png', source: require('../../../assets/avatars/3.png') },
  { id: 5, name: '4.png', source: require('../../../assets/avatars/4.png') },
];

export default function Profile({ onNavigate }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ✅ Added state for pull-to-refresh handling
  const [isGuest, setIsGuest] = useState(false);
  const [gateVisible, setGateVisible] = useState(false); 
  const [isConnected, setIsConnected] = useState(true);
  const hasInitialized = useRef(false);

  // Profile States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userAvatar, setUserAvatar] = useState(availableAvatars[0].source);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      if (!connected) {
        setLoading(false); 
        setRefreshing(false);
        setIsGuest(true);
        setFirstName('Guest');
        setLastName('User');
        setStreakCount(0);
        setUserAvatar(availableAvatars[0].source);
        return;
      }

      if (!hasInitialized.current) {
        hasInitialized.current = true;
        loadProfileData();
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Modified to cleanly support both standard initial loads and pull-to-refresh instances
  const loadProfileData = async (isManualRefresh = false) => {
    if (!isConnected) {
      setRefreshing(false);
      return; 
    }
    
    if (!hasInitialized.current && !isManualRefresh) {
      setLoading(true);
    }

    try {
      const role = await AsyncStorage.getItem('@user_role');
      const guestMode = await AsyncStorage.getItem('@guest_mode');
      const { data: { session } } = await supabase.auth.getSession();

      const isGuest = role === 'guest' || guestMode !== null || !session || !isConnected;
      setIsGuest(isGuest);

      if (isGuest) {
        setFirstName('Guest');
        setLastName('User');
        setStreakCount(0);
        setUserAvatar(availableAvatars[0].source);
        return;
      }

      await Promise.all([
        fetchUserProfile(),
        fetchStreak()
      ]);

    } catch (error) {
      console.log('Profile load error:', error);
      setIsGuest(true);
      setFirstName('Guest');
      setLastName('User');
    } finally {
      setLoading(false);
      setRefreshing(false); // ✅ Safely terminates the pull-to-refresh load loop indicator
    }
  };

  // ✅ Created handler explicitly for the RefreshContainer's onRefresh trigger
  const handleRefresh = () => {
    setRefreshing(true);
    loadProfileData(true);
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(endpoints.USER_PROFILE, {
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

      const response = await fetch(endpoints.USER_STREAK, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      if (result.success) setStreakCount(result.data.streak);
    } catch (error) {
      console.error("Profile Streak Fetch Error:", error);
    }
  };

  const handleProtectedAction = (targetPath) => {
    if (isGuest || !isConnected) {
      setGateVisible(true);
      return;
    }
    router.push(targetPath);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['@user_token', '@user_role', '@user_metadata', '@guest_mode']);
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
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />

      <ProfileTopBar title="Profile" />

      {/* ✅ SWAPPED: ScrollView has been replaced by the custom RefreshContainer */}
      <RefreshContainer
        style={styles.scrollBody}
        contentContainerStyle={{ paddingBottom: 110 }} // Keeps your layout footer buffer intact
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
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
          <TouchableOpacity style={styles.menuItem} onPress={() => handleProtectedAction('/Account/AccountInformation')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/profileIcon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Account Information</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleProtectedAction('/Account/Activities')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/activities_icon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>My Activities</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleProtectedAction('/Account/Streaks')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/images/beefire.png')} style={styles.menuIcon} />
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
        </View>
      </RefreshContainer>

      <FeatureGateModal visible={gateVisible} onClose={() => setGateVisible(false)} />

      <BottomNav activeTab="Profile" />
    </View>
  );
}