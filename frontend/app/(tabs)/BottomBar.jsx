import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import dictionaryIcon from '../../assets/icons/dictionaryIcon.png';
import translateIcon from '../../assets/icons/translateIcon1.png';
import learnIcon from '../../assets/icons/profileIcon.png';
import homeIcon from '../../assets/icons/homeIcon.png';
import gameIcon from '../../assets/icons/gameIcon.png';

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const routes = [
    { key: 'dictionary', title: 'Dictionary', path: '/Dictionary/Dictionary', icon: dictionaryIcon },
    { key: 'translate', title: 'Translate', path: '/Translator/TextToText', icon: translateIcon },
    { key: 'home', title: 'Home', path: '/Home', icon: homeIcon },
    { key: 'games', title: 'Games', path: '/Games/Games', icon: gameIcon },
    { key: 'profile', title: 'Profile', path: '/Account/Profile', icon: learnIcon },
  ];

  return (
    <View style={styles.container}>
      {routes.map((route) => {
        const isActive = pathname === route.path;

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.tabItem, isActive && styles.activeTabItem]}
            onPress={() => router.push(route.path)}
          >
            {isActive && <View style={styles.activeIndicator} />}
            
            <Image
              source={route.icon}
              style={[
                styles.icon,
                isActive ? styles.activeIcon : styles.inactiveIcon
              ]}
            />
            
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {route.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FBBF24', 
    height: 80,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
    elevation: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeTabItem: {
    marginTop: -35, // This "enlarges" and lifts the button
  },
  activeIndicator: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#FBBF24', // Matches the bar to create the "hump" effect
    top: -5,
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  activeIcon: {
    width: 45, // Enlarged icon size
    height: 45,
    // tintColor: '#000', // Black font/icon
  },
  inactiveIcon: {
    // tintColor: '#000', // Black font/icon for inactive too
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000', // Black labels
    marginTop: 4,
  },
  activeLabel: {
    marginTop: 8,
  }
});