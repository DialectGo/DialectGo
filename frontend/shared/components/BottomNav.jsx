import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Easing
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FeatureGateModal from './FeatureGateModal';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabItem = ({ icon, ioniconName, label, isActive, onPress }) => {
  const animatedWidth = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isActive ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false, // Must be false for width/padding animation
    }).start();
  }, [isActive]);

  const pillWidth = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 110], // Approximate widths
  });

  const textOpacity = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const backgroundColor = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#FFFFFF'],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[styles.tabItem, { backgroundColor }]}>
        {ioniconName ? (
          <Ionicons
            name={isActive ? ioniconName : `${ioniconName}-outline`}
            size={24}
            color={isActive ? '#000000' : '#8C7423'}
          />
        ) : (
          <Image
            source={icon}
            style={styles.tabIcon}
            resizeMode="contain"
          />
        )}
        
        {isActive && (
          <Animated.View style={{ opacity: textOpacity, marginLeft: 8, overflow: 'hidden' }}>
            <Text style={styles.activeLabel} numberOfLines={1}>
              {label}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [gateVisible, setGateVisible] = useState(false);
  const insets = useSafeAreaInsets();

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
    { name: 'Home', path: '/Home', icon: require('../../assets/icons/homeIcon.png'), isGated: false },
    { name: 'Dictionary', path: '/Dictionary/Dictionary', icon: require('../../assets/icons/dictionaryIcon.png'), isGated: false },
    { name: 'Translate', path: '/Translator/Translate', icon: require('../../assets/icons/translateIcon1.png'), isGated: false },
    { name: 'Wiki', path: '/Wiki/WikiFeed', ioniconName: 'book', isGated: true },
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
    <View style={[styles.navContainer, { bottom: Math.max(insets.bottom, 15) }]}>
      <View style={styles.bottomTab}>
        {tabs.map((tab) => {
          const currentPath = pathname.toLowerCase();
          const isTabActive = currentPath.includes(tab.name.toLowerCase()) || (currentPath === '/' && tab.name === 'Home');

          return (
            <TabItem
              key={tab.name}
              icon={tab.icon}
              ioniconName={tab.ioniconName}
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
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  bottomTab: {
    flexDirection: 'row',
    backgroundColor: '#FFD54F',
    height: 60,
    borderRadius: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 15,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  activeLabel: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
  },
});