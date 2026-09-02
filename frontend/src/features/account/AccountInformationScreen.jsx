import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { styles } from './styles/AccountInformationStyles';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../components/ProfileTopBar';
import { useAccountInformation } from '../../shared/hooks/profile/useAccountInformation';
import { useProfileContext } from '../../shared/context/ProfileContext';
import AccountFormInput from '../../shared/components/profile/AccountFormInput';

export default function AccountInformationScreen() {
  const router = useRouter();
  
  const {
    loading,
    firstName, setFirstName,
    lastName, setLastName,
    birthDate, setBirthDate,
    email,
    address, setAddress,
    handleSave,
  } = useAccountInformation(router);

  const { userAvatar } = useProfileContext();

  if (loading) return <ActivityIndicator size="large" color="#FFD54F" style={{flex:1}} />;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      <ProfileTopBar title="Account Information" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 10 }}>
          <View style={{
            width: 130, height: 130, borderRadius: 65, backgroundColor: '#FFFFFF',
            justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFFFFF',
            elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1, shadowRadius: 10,
          }}>
            <Image source={userAvatar} style={{ width: 115, height: 115, borderRadius: 57.5, resizeMode: 'contain' }} />
          </View>
        </View>
        
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
