import React from 'react';
import { BottomNavigation } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
import { Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function BottomBar() {
    const router = useRouter();
    const pathname = usePathname(); 

    const routes = [
        { key: 'home', title: 'Home', path: '/Home', focusedIcon: 'home', unfocusedIcon: 'home-outline'},
        { key: 'translate', title: 'Translate', path: '/Translator/Translate', focusedIcon: 'translate', unfocusedIcon: 'translate-variant'},
    ];

    const index = routes.findIndex(r => r.path === pathname);
    const activeIndex = index >= 0 ? index : 0;

  return (
    <BottomNavigation.Bar
      navigationState={{ index: activeIndex, routes }}
      onTabPress={({ route }) => {
        if (pathname !== route.path) {
          router.push(route.path);
        }
      }}
      renderIcon={({ route, focused, color }) => (
        <MaterialCommunityIcons 
          name={focused ? route.focusedIcon : route.unfocusedIcon} 
          size={24} 
          color={color} 
        />
      )}
      style={{ backgroundColor: '#fff' }}
      inactiveColor='#48AAD9'       
      activeColor='#FFFFFF' 
      activeIndicatorStyle={{
        backgroundColor: '#48AAD9',
      }}
      renderLabel={({ route, color }) => (
        <Text style={{ color: '#48AAD9', fontSize: 10, textAlign: 'center' }}>
          {route.title}
        </Text>
      )}
      labeled={true}
    />
  );
}