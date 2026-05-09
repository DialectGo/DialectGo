import React from 'react';
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNav from '../../../shared/components/BottomNav';
import { styles } from '../../../shared/styles/ProfileStyles';

export default function Profile({ onNavigate, user }) {
  const router = useRouter();

  const firstName = user?.firstName || 'Maria';
  const lastName = user?.lastName || 'Clara';
  const userStreak = user?.streak || '24';
  const userAvatar = user?.avatar || require('../../../assets/avatars/maria_clara.png');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      
      {/* YELLOW HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image source={require('../../../assets/icons/backArrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
        {/* PROFILE HEADER SECTION */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image source={userAvatar} style={styles.avatarImg} />
          </View>
          <Text style={styles.userName}>{`${firstName} ${lastName}`}</Text>
          <Text style={styles.streakText}>{userStreak}days streak</Text>
        </View>

        {/* SETTINGS CONTAINER - Rounded Yellow Box */}
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Account/AccountInformation')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/profileIcon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Account Information</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Account/Streaks')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/fireIcon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Streaks</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Account/Settings')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/settings_icon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Settings</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Account/About')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/info_icon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>About DialectGo</Text>
            </View>
            <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={() => onNavigate('auth')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/logout_icon.png')} style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Log out</Text>
            </View>
          </TouchableOpacity>
          
          <View style={{ height: 50 }} />
        </View>
      </ScrollView>

      <BottomNav activeTab="Profile" />
    </SafeAreaView>
  );
}