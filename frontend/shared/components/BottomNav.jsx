import React, { useEffect, useRef } from 'react';
import { 
  Animated, 
  Image, 
  Platform, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { useRouter, usePathname } from 'expo-router'; 

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

  const tabs = [
    { name: 'Dictionary', path: '/Dictionary/Dictionary', icon: require('../../assets/icons/dictionaryIcon.png') },
    { name: 'Translate', path: '/Translator/Translate', icon: require('../../assets/icons/translateIcon1.png') },
    { name: 'Home', path: '/Home', icon: require('../../assets/icons/homeIcon.png') }, 
    { name: 'Games', path: '/Games/Games', icon: require('../../assets/icons/gameIcon.png') },
    { name: 'Profile', path: '/Account/Profile', icon: require('../../assets/icons/profile_icon.png') },
  ];
  
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
              onPress={() => router.push(tab.path)} 
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  bottomTab: {
    flexDirection: 'row',
    backgroundColor: '#FFD54F', 
    height: 80, // Binabaan ang height mula 95
    justifyContent: 'space-around',
    alignItems: 'center',
    // Binawasan ang paddingBottom para bumaba ang pwesto ng icons at labels
    paddingBottom: Platform.OS === 'ios' ? 15 : 5, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2, // Binawasan mula 5 para mas malapit sa label
  },
  tabIcon: {
    width: 38, // Binawasan nang bahagya para hindi masyadong siksik dahil binabaan ang height
    height: 38,
  },
  activeShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11, // Binabaan ang size para sa cleaner look
    fontWeight: '800',
    color: '#5D4037',
    marginTop: 2,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#212121',
    fontWeight: '900',
    fontSize: 11.5,
  }
});