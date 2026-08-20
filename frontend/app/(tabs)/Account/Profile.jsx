import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { 
  Image, 
  StatusBar, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../../src/components/ProfileTopBar';
import BottomNav from '../../../src/components/BottomNav';
import FeatureGateModal from '../../../src/shared/components/FeatureGateModal'; 
import RefreshContainer from '../../../src/shared/components/RefreshContainer';
import { styles } from '../../../src/features/account/styles/ProfileStyles';
import { formatFullName } from '../../../src/shared/utils/stringUtils';
import { useProfile } from '../../../src/shared/hooks/profile/useProfile';

export default function Profile({ onNavigate }) {
  const router = useRouter();
  
  const {
    loading,
    refreshing,
    isGuest,
    gateVisible,
    setGateVisible,
    firstName,
    lastName,
    userAvatar,
    streakCount,
    handleRefresh,
    handleProtectedAction,
    handleLogout
  } = useProfile(onNavigate, router);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#FFD54F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />

      <ProfileTopBar title="Profile" />

      <RefreshContainer
        style={styles.scrollBody}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image source={userAvatar} style={styles.avatarImg} />
          </View>
          <Text style={styles.userName}>{formatFullName(firstName, lastName)}</Text>
          <Text style={styles.streakText}>
            {isGuest ? 'Sign in to accumulate streaks' : `${streakCount} days streak`}
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleProtectedAction('/Account/AccountInformation')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/profile/profileIcon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Account Information</Text>
            </View>
            <Image source={require('../../../assets/icons/nav/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleProtectedAction('/Account/Activities')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/profile/activities_icon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>My Activities</Text>
            </View>
            <Image source={require('../../../assets/icons/nav/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleProtectedAction('/Account/Streaks')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/images/beefire.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Streaks</Text>
            </View>
            <Image source={require('../../../assets/icons/nav/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Account/Settings')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/profile/settings_icon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Settings</Text>
            </View>
            <Image source={require('../../../assets/icons/nav/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Account/About')}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/profile/info_icon.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>About DialectGo</Text>
            </View>
            <Image source={require('../../../assets/icons/nav/forward_arrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <Image source={require('../../../assets/icons/actions/logout_icon.png')} style={styles.logoutIcon} />
              <Text style={styles.logoutText}>{isGuest ? 'Exit Guest Mode' : 'Log out'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </RefreshContainer>

      <FeatureGateModal visible={gateVisible} onClose={() => setGateVisible(false)} />

      <BottomNav activeTab="Profile" />
    </View>
  );
}