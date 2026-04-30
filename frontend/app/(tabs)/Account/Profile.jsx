import React from 'react';
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import BottomNav from '../../../shared/components/BottomNav';
import TopBar from '../../../shared/components/TopBar';
import { styles } from '../../../shared/styles/ProfileStyles';
import { useRouter } from 'expo-router';

export default function Profile({ onNavigate, user }) {
  const router = useRouter();

  // Data mula sa 'user' prop para dynamic ang UI
  const firstName = user?.firstName || "Maria Clara";
  const lastName = user?.lastName || "Alba";
  const userStreak = user?.streak || "0";
  const userAvatar = user?.avatar || require('../../../assets/avatars/maria_clara.png');

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" translucent={false} />
      
      {/* Ginagamit ang TopBar o Custom Header dito */}
      <TopBar onMenuPress={() => console.log("Menu Pressed!")} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        bounces={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* WHITE SECTION (Avatar Area) */}
        <View style={styles.whiteBackground}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Image 
                source={userAvatar} 
                style={styles.avatarImg} 
              />
            </View>
            <Text style={styles.userName}>{`${firstName} ${lastName}`}</Text>
            <Text style={styles.streakText}>{userStreak} days streak</Text>
          </View>
        </View>

        {/* YELLOW SECTION (Menu Area) */}
        <View style={styles.menuContainer}>
          
          {/* Account Information - CONNECTED PATH */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/Account/AccountInformation')} 
          >
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/profileIcon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Account Information</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          {/* Streaks */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/Account/Streaks')} 
          >
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/lock_icon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Streaks</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/Account/Settings')} 
          >
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/settings_icon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Settings</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/Account/About')} 
          >
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/info_icon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>About DialectGo</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          {/* Log Out */}
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: '#FFED99', marginTop: 10 }]} 
            onNavigate={() => onNavigate('auth')}
          >
            <View style={styles.menuLeft}>
              <Image 
                source={require('../../../assets/icons/logout_icon.png')} 
                style={[styles.menuIcon, { tintColor: '#D32F2F' }]} 
              />
              <Text style={[styles.menuText, { color: '#D32F2F' }]}>Log Out</Text>
            </View>
          </TouchableOpacity>

          {/* FILLER */}
          <View style={{ height: 100, backgroundColor: '#FFD54F' }} />
        </View>
      </ScrollView>

      {/* FIXED BOTTOM NAVIGATION */}
    </View>
  );
}