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
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF', // Changed to white to match your page bg
    zIndex: 1000,
    // Add the top border here to define the boundary
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0', // A light grey line for a subtle boundary
  },
  bottomTab: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // Match the container
    height: Platform.OS === 'ios' ? 90 : 70, 
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 25 : 10, 
    // Remove elevation/shadow if you want a flat look, or keep it subtle
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    fontSize: 11,
    fontWeight: '800',
    color: '#757575', // Adjusted to a grey that looks better on white
    marginTop: 2,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#FFD54F', // You can use your original yellow as the active text color
    fontWeight: '900',
    fontSize: 11.5,
  },
});