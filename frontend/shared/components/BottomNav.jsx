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
      friction: 4,
      tension: 40,
    }).start();
  }, [isActive]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -22], 
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25], 
  });

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.tabItem} 
      activeOpacity={0.7} 
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View style={[styles.iconContainer, { transform: [{ translateY }, { scale }] }]}>
        <View style={[styles.iconCircle, isActive && styles.activeCircle]}>
          <Image 
            source={icon} 
            style={styles.tabIcon} 
            resizeMode="contain" 
          />
        </View>
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
    { name: 'Dictionary', path: '/Dictionary/Dictionary', icon: require('../../assets/icons/dictionary_icon.png') },
    { name: 'Translate', path: '/Translator/Translate', icon: require('../../assets/icons/translate_icon.png') },
    { name: 'Home', path: '/Home', icon: require('../../assets/icons/home_icon.png') }, 
    { name: 'Games', path: '/Games/Games', icon: require('../../assets/icons/game_icon.png') },
    { name: 'Profile', path: '/Account/Profile', icon: require('../../assets/icons/profile_icon.png') },
  ];
  
  return (
    <View style={styles.navContainer}>
      <View style={styles.bottomTab}>
        {tabs.map((tab) => {
          // --- PINALAKAS NA MATCHING LOGIC ---
          const currentPath = pathname.toLowerCase();
          const tabName = tab.name.toLowerCase();
          
          // Magiging true kung:
          // 1. Ang path ay exact match (e.g. /home)
          // 2. Ang path ay root "/" at ito ang Home tab
          // 3. Ang current path ay naglalaman ng tab name (para sa (tabs) groups)
          const isTabActive = 
            currentPath === tab.path.toLowerCase() || 
            (currentPath === '/' && tabName === 'home') ||
            currentPath.includes(tabName);

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
    elevation: 20, 
  },
  bottomTab: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    height: 90, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    shadowColor: '#421C00',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  iconCircle: {
    width: 55, 
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', 
  },
  activeCircle: {
    backgroundColor: '#FFD54F', 
    elevation: 8,
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  tabIcon: {
    width: 30, 
    height: 30,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E9E9E', 
    marginTop: 4,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#421C00', 
    fontWeight: '900',
  }
});