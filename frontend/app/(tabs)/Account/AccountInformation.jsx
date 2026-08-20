import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../../../src/features/account/styles/AccountInformationStyles';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../../src/components/ProfileTopBar';
import { useAccountInformation } from '../../../src/shared/hooks/profile/useAccountInformation';
import AvatarSelector from '../../../src/shared/components/profile/AvatarSelector';
import AccountFormInput from '../../../src/shared/components/profile/AccountFormInput';

export default function AccountInformation() {
  const router = useRouter();
  
  const {
    loading,
    firstName, setFirstName,
    lastName, setLastName,
    birthDate, setBirthDate,
    email,
    address, setAddress,
    currentAvatar,
    isModalVisible, setIsModalVisible,
    handleSave,
    handleAvatarSelect,
    availableAvatars
  } = useAccountInformation(router);

  if (loading) return <ActivityIndicator size="large" color="#FFD54F" style={{flex:1}} />;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      <ProfileTopBar title="Account Information" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <AvatarSelector 
          currentAvatar={currentAvatar}
          availableAvatars={availableAvatars}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          onSelect={handleAvatarSelect}
        />

        <View style={styles.settingsContainer}>
          <AccountFormInput label="First Name" value={firstName} onChangeText={setFirstName} />
          <AccountFormInput label="Last Name" value={lastName} onChangeText={setLastName} />
          <AccountFormInput label="Birth Date" value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" />
          <AccountFormInput label="Address (Country, Province, City)" value={address} onChangeText={setAddress} placeholder="Philippines, Laguna, Calamba" />
          <AccountFormInput label="Email Address" value={email} editable={false} />

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: '#FFFDE7', borderWidth: 2, borderColor: '#FFD54F', marginBottom: 14 }]} 
            onPress={() => router.push({ pathname: '/auth/ForgotPassword', params: { email } })}
          >
            <Text style={[styles.saveBtnText, { color: '#5D4037', fontWeight: 'bold' }]}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
          <View style={{ height: 50 }} />
        </View>
      </ScrollView>
    </View>
  );
}