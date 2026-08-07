import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../shared/lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NotificationsModal from './NotificationsModal';
import { NOTIFICATIONS_API_BASE } from '../config/apiConfig';

const availableAvatars = [
  { id: 1, name: 'maria_clara.png', source: require('../../assets/avatars/maria_clara.png') },
  { id: 2, name: '1.png', source: require('../../assets/avatars/1.png') },
  { id: 3, name: '2.png', source: require('../../assets/avatars/2.png') },
  { id: 4, name: '3.png', source: require('../../assets/avatars/3.png') },
  { id: 5, name: '4.png', source: require('../../assets/avatars/4.png') },
];

const TopBar = () => {
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userAvatar, setUserAvatar] = useState(availableAvatars[0].source);
  const router = useRouter();

  useEffect(() => {
    fetchTopBarData();
  }, []);

  const fetchTopBarData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Fetch avatar
      const { data: userData } = await supabase.auth.getUser(session.access_token);
      if (userData?.user?.user_metadata?.avatar_url) {
        const found = availableAvatars.find(a => a.name === userData.user.user_metadata.avatar_url);
        if (found) setUserAvatar(found.source);
      }

      // Fetch unread count
      const response = await fetch(NOTIFICATIONS_API_BASE, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await response.json();
      if (json.success) {
        setUnreadCount(json.data.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.log('[TopBar] fetch error:', err);
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          {/* Logo Section (Removed per request) */}
          <View style={styles.leftSection}>
          </View>

          {/* Right Section (Glassmorphism Pill Buttons) */}
          <View style={styles.rightSection}>
            
            <TouchableOpacity 
              style={styles.glassBtn} 
              onPress={() => {
                setNotificationsVisible(true);
                setUnreadCount(0); // Optimistic clear
              }}
            >
              <Ionicons name="notifications-outline" size={20} color="#1F2937" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.glassBtn}
              onPress={() => handleNavigation('/Account/Profile')}
            >
              <Image source={userAvatar} style={styles.avatarIcon} />
            </TouchableOpacity>

          </View>
        </View>
      </SafeAreaView>

      {/* --- NOTIFICATIONS MODAL --- */}
      <NotificationsModal 
        visible={notificationsVisible} 
        onClose={() => {
          setNotificationsVisible(false);
          fetchTopBarData(); // Refresh count on close
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 55,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  miniLogoHeader: {
    width: 32,
    height: 32,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Space between glass buttons
  },
  glassBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.06)', // Subdued glassmorphism background
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});

export default TopBar;