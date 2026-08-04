import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { supabase } from '../../shared/lib/supabase';
import { useRouter } from 'expo-router';
import { handleLogout } from '../../app/Logout';
import { Ionicons } from '@expo/vector-icons';
import NotificationsModal from './NotificationsModal';
import { NOTIFICATIONS_API_BASE } from '../config/apiConfig';

const TopBar = ({ onLogout, onProfile, onAbout, onSettings }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  React.useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch(NOTIFICATIONS_API_BASE, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await response.json();
      if (json.success) {
        setUnreadCount(json.data.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.log('[TopBar] unread count error:', err);
    }
  };

  const onSignOutPress = async () => {
    setMenuVisible(false); // Close menu
    await handleLogout();  // Run the logic from Logout.jsx
  };

  const handleNavigation = (path) => {
    setMenuVisible(false); // Close menu first
    router.push(path);     // Navigate to the absolute path
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          {/* Logo Section */}
          <View style={styles.leftSection}>
            <Image
              source={require('../../assets/logo/bee.png')}
              style={styles.miniLogoHeader}
              resizeMode="contain"
            />
          </View>

          {/* Right Section (Kebab Dots & Bell) */}
          <View style={styles.rightSection}>
            <TouchableOpacity 
              style={styles.bellBtn} 
              onPress={() => {
                setNotificationsVisible(true);
                setUnreadCount(0); // Optimistic clear
              }}
            >
              <Ionicons name="notifications-outline" size={24} color="#1F2937" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuBtn}  
              onPress={() => setMenuVisible(true)} // Dito lalabas ang menu
              activeOpacity={0.6}
            >
              <View style={styles.kebabContainer}>
                <View style={styles.kebabDot} />
                <View style={styles.kebabDot} />
                <View style={styles.kebabDot} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* --- MENU OPTIONS MODAL --- */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuCard}>
              {/* Option 1: Profile */}
              {/* Option 1: Profile */}
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => handleNavigation('/Account/Profile')}
              >
                <Text style={styles.menuText}>Profile</Text>
              </TouchableOpacity>

              {/* Option 3: Settings */}
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => handleNavigation('/Account/Settings')}
              >
                <Text style={styles.menuText}>Settings</Text>
              </TouchableOpacity>

              {/* Option 4: Logout (With Touch of Yellow/Orange) */}
              <TouchableOpacity 
                style={[styles.menuItem, styles.lastItem]} 
                onPress={onSignOutPress} // Uses the new utility
              >
                <Text style={[styles.menuText, { color: '#FFB300', fontWeight: 'bold' }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* --- NOTIFICATIONS MODAL --- */}
      <NotificationsModal 
        visible={notificationsVisible} 
        onClose={() => {
          setNotificationsVisible(false);
          fetchUnreadCount(); // Refresh count on close
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFD54F', // Solid Yellow
    shadowColor: '#000',
    shadowRadius: 3,
    elevation: 5,
  },
  safeArea: {
    backgroundColor: '#ffffff', // Ginawang Yellow para match sa container mo
  },
  topBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  leftSection: {
    flex: 1,
  },
  miniLogoHeader: {
    width: 38,
    height: 38,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 15,
  },
  bellBtn: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kebabContainer: {
    height: 20,
    width: 20,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  kebabDot: {
    width: 5,
    height: 5,
    backgroundColor: '#000000', // Black dots gaya ng request mo
    borderRadius: 5,
  },
  
  // --- MENU STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)', // Sobrang light na shadow lang
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuCard: {
    marginTop: 60, // Sa ilalim ng TopBar lalabas
    marginRight: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 160,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#FFD54F', // Touch of Yellow border
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  lastItem: {
    borderBottomWidth: 0,
    backgroundColor: '#FFFDE7', // Touch of light yellow para sa logout area
  },
  menuText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'System', // Pwede mong palitan ng Poppins kung naka-install
  },
});

export default TopBar;