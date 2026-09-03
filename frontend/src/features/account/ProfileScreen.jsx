import React, { useState } from 'react';
import { 
  StatusBar, 
  View, 
  ActivityIndicator,
  Text 
} from 'react-native';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../components/ProfileTopBar';
import BottomNav from '../../components/BottomNav';
import FeatureGateModal from '../../shared/components/FeatureGateModal'; 
import LogoutConfirmModal from '../../shared/components/LogoutConfirmModal';
import RefreshContainer from '../../shared/components/RefreshContainer';
import { styles } from './styles/ProfileStyles';
import { useProfile } from '../../shared/hooks/profile/useProfile';
import ProfileMenuItem from '../../shared/components/profile/ProfileMenuItem';
import AvatarSelector from '../../shared/components/profile/AvatarSelector';
import { availableAvatars } from '../../shared/hooks/profile/constants';
import { updateUserProfile } from '../../shared/services/profile/userService';
import { useToast } from '../../shared/context/ToastContext';
import { formatFullName } from '../../shared/utils/stringUtils';

export default function ProfileScreen({ onNavigate }) {
  const router = useRouter();
  
  const {
    loading,
    refreshing,
    gateVisible,
    setGateVisible,
    firstName,
    lastName,
    userAvatar,
    streakCount,
    handleRefresh,
    handleProtectedAction,
    handleLogout,
    logoutModalVisible,
    isSavingProfile,
    handleSaveAndLogout,
    handleLogoutWithoutSaving,
    handleCancelLogout,
  } = useProfile(onNavigate, router);

  const { showToast } = useToast();
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

  const currentAvatarObj = availableAvatars.find(a => a.source === userAvatar) || availableAvatars[0];

  const handleAvatarSelect = async (avatarObj) => {
    setIsAvatarModalVisible(false);
    
    try {
      const success = await updateUserProfile({ profile_avatar_url: avatarObj.name });
      if (success) {
        handleRefresh();
        showToast('Avatar updated successfully!', 'success', 'Saved');
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      showToast('Failed to update avatar', 'error', 'Error');
    }
  };

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
        <View style={{ alignItems: 'center', paddingBottom: 20 }}>
          <AvatarSelector 
            currentAvatar={currentAvatarObj}
            availableAvatars={availableAvatars}
            isModalVisible={isAvatarModalVisible}
            setIsModalVisible={setIsAvatarModalVisible}
            onSelect={handleAvatarSelect}
          />
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000000', marginTop: -5, fontFamily: 'Poppins-Bold' }}>
            {formatFullName(firstName, lastName)}
          </Text>
          <Text style={{ fontSize: 16, color: '#777', fontWeight: '600', fontFamily: 'Poppins-Regular', marginTop: 5 }}>
            {`${streakCount} days streak`}
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/account_information_icon.png')}
            text="Account Information"
            onPress={() => handleProtectedAction('/Account/AccountInformation')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/activities_icon.png')}
            text="My Activities"
            onPress={() => handleProtectedAction('/Account/Activities')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/streak_icon.png')}
            text="Streaks"
            onPress={() => handleProtectedAction('/Account/Streaks')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/settings_icon.png')}
            text="Settings"
            onPress={() => router.push('/Account/Settings')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/about_dialectgo_icon.png')}
            text="About DialectGo"
            onPress={() => router.push('/Account/About')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/actions/logout_icon.png')}
            text="Log out"
            onPress={handleLogout}
            isLogout={true}
          />
        </View>
      </RefreshContainer>

      <FeatureGateModal visible={gateVisible} onClose={() => setGateVisible(false)} />
      <LogoutConfirmModal
        visible={logoutModalVisible}
        onSaveAndLogout={handleSaveAndLogout}
        onLogoutWithoutSaving={handleLogoutWithoutSaving}
        onCancel={handleCancelLogout}
        isSaving={isSavingProfile}
      />
      <BottomNav activeTab="Profile" />
    </View>
  );
}
