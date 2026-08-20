import React from 'react';
import { 
  StatusBar, 
  View, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../../src/components/ProfileTopBar';
import BottomNav from '../../../src/components/BottomNav';
import FeatureGateModal from '../../../src/shared/components/FeatureGateModal'; 
import RefreshContainer from '../../../src/shared/components/RefreshContainer';
import { styles } from '../../../src/features/account/styles/ProfileStyles';
import { useProfile } from '../../../src/shared/hooks/profile/useProfile';
import ProfileHeader from '../../../src/shared/components/profile/ProfileHeader';
import ProfileMenuItem from '../../../src/shared/components/profile/ProfileMenuItem';

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
        <ProfileHeader 
          firstName={firstName} 
          lastName={lastName} 
          userAvatar={userAvatar} 
          isGuest={isGuest} 
          streakCount={streakCount} 
        />

        <View style={styles.settingsContainer}>
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/profileIcon.png')}
            text="Account Information"
            onPress={() => handleProtectedAction('/Account/AccountInformation')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/activities_icon.png')}
            text="My Activities"
            onPress={() => handleProtectedAction('/Account/Activities')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/images/beefire.png')}
            text="Streaks"
            onPress={() => handleProtectedAction('/Account/Streaks')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/settings_icon.png')}
            text="Settings"
            onPress={() => router.push('/Account/Settings')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/info_icon.png')}
            text="About DialectGo"
            onPress={() => router.push('/Account/About')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/actions/logout_icon.png')}
            text={isGuest ? 'Exit Guest Mode' : 'Log out'}
            onPress={handleLogout}
            isLogout={true}
          />
        </View>
      </RefreshContainer>

      <FeatureGateModal visible={gateVisible} onClose={() => setGateVisible(false)} />
      <BottomNav activeTab="Profile" />
    </View>
  );
}