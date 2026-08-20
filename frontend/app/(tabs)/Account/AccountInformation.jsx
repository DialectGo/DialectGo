import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../../../src/features/account/styles/AccountInformationStyles';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../../src/components/ProfileTopBar';
import { useAccountInformation } from '../../../src/shared/hooks/profile/useAccountInformation';

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
        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image source={currentAvatar.source} style={styles.avatarImg} />
            <TouchableOpacity 
              style={styles.editBadge} 
              onPress={() => setIsModalVisible(true)}
            >
              <Image 
                source={require('../../../assets/icons/actions/edit_icon.png')} 
                style={styles.editIcon} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.changeText}>Tap to change avatar</Text>
        </View>

        {/* FORM SECTION */}
        <View style={styles.settingsContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>First Name</Text>
            <TextInput 
              style={styles.textInput} 
              value={firstName} 
              onChangeText={setFirstName} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            <TextInput 
              style={styles.textInput} 
              value={lastName} 
              onChangeText={setLastName} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Birth Date</Text>
            <TextInput 
              style={styles.textInput} 
              value={birthDate} 
              onChangeText={setBirthDate} 
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Address (Country, Province, City)</Text>
            <TextInput 
              style={styles.textInput} 
              value={address} 
              onChangeText={setAddress} 
              placeholder="Philippines, Laguna, Calamba"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput 
              style={styles.textInput} 
              value={email} 
              editable={false}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.saveBtn, 
              { 
                backgroundColor: '#FFFDE7', 
                borderWidth: 2, 
                borderColor: '#FFD54F',
                marginBottom: 14 
              }
            ]} 
            onPress={() => {
              router.push({
                  pathname: '/auth/ForgotPassword', 
                  params: { email }
                });
            }}
          >
            <Text style={[styles.saveBtnText, { color: '#5D4037', fontWeight: 'bold' }]}>
              Change Password
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
          
          <View style={{ height: 50 }} />
        </View>
      </ScrollView>

      {/* AVATAR SELECTION MODAL */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Avatar</Text>
            <View style={styles.avatarGrid}>
              {availableAvatars.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => handleAvatarSelect(item)}
                  style={[
                    styles.avatarOption,
                    currentAvatar.id === item.id && styles.activeAvatarOption
                  ]}
                >
                  <Image source={item.source} style={styles.modalAvatarImg} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}