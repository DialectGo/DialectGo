import React, { useEffect, useRef, useState } from 'react';
import { 
  Animated, 
  Image, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { useRouter, usePathname } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import FeatureGateModal from './FeatureGateModal'; 
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';

const TabItem = ({ icon, label, isActive, onPress }) => {
  const animatedValue = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    }).start();
  }, [isActive]);

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35], 
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10], 
  });

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.tabItem} 
      activeOpacity={1} 
    >
      <Animated.View style={[
        styles.iconWrapper,
        { transform: [{ scale }, { translateY }] },
        isActive && styles.activeShadow 
      ]}>
        <Image 
          source={icon} 
          style={styles.tabIcon} 
          resizeMode="contain" 
        />
      </Animated.View>
      
      <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [gateVisible, setGateVisible] = useState(false);

  const [isConnected, setIsConnected] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      if (!connected) {
        setIsGuestMode(true);
      } else {
        checkUserMode(); 
      }
    });

    return () => unsubscribe();
  }, []);

  const checkUserMode = async () => {
    try {
      const role = await AsyncStorage.getItem('@user_role');
      const guestMode = await AsyncStorage.getItem('@guest_mode');
      const { data: { session } } = await supabase.auth.getSession();

      const isGuest = role === 'guest' || guestMode !== null || !session;
      setIsGuestMode(isGuest);

    } catch (err) {
      console.log('BottomNav auth check error:', err);
      setIsGuestMode(true);
    }
  };

  const tabs = [
    { name: 'Dictionary', path: '/Dictionary/Dictionary', icon: require('../../assets/icons/dictionaryIcon.png'), isGated: false },
    { name: 'Translate', path: '/Translator/Translate', icon: require('../../assets/icons/translateIcon1.png'), isGated: false },
    { name: 'Home', path: '/Home', icon: require('../../assets/icons/homeIcon.png'), isGated: false }, 
    { name: 'Games', path: '/Games/Games', icon: require('../../assets/icons/gameIcon.png'), isGated: true }, 
    { name: 'Profile', path: '/Account/Profile', icon: require('../../assets/icons/profile_icon.png'), isGated: false },
  ];

  const handleNavigationInterception = async (tab) => {
    if (tab.isGated) {
      if (!isConnected || isGuestMode) {
        setGateVisible(true);
        return;
      }
    }
    router.push(tab.path);
  };
  
  return (
    <View style={styles.navContainer}>
      <View style={styles.bottomTab}>
        {tabs.map((tab) => {
          const currentPath = pathname.toLowerCase();
          const isTabActive = currentPath.includes(tab.name.toLowerCase()) || (currentPath === '/' && tab.name === 'Home');

          return (
            <TabItem
              key={tab.name}
              icon={tab.icon}
              label={tab.name}
              isActive={isTabActive} 
              onPress={() => handleNavigationInterception(tab)} 
            />
          );
        })}
      </View>
      <FeatureGateModal visible={gateVisible} onClose={() => setGateVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomTab: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    // ✅ FIX 1: Standardized a unified height across iOS and Android
    height: 65, 
    justifyContent: 'space-around',
    alignItems: 'center',
    // ✅ FIX 2: Removed Platform specific bottom padding causing the empty float gap
    paddingBottom: 0, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%', // ✅ Ensures full touch target engagement
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  tabIcon: {
    width: 28, // ✅ Scaled down slightly so layout remains perfectly balanced at 65px height
    height: 28,
  },
  activeShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#757575',
    marginTop: 1,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#FFD54F',
    fontWeight: '900',
    fontSize: 10.5,
  },
});