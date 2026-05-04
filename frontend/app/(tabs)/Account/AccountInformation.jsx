import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '../../../shared/styles/AccountInformationStyles';

// Listahan ng iyong available avatars
const availableAvatars = [
  { id: 1, source: require('../../../assets/avatars/maria_clara.png') },
  { id: 2, source: require('../../../assets/avatars/1.png') },
  { id: 3, source: require('../../../assets/avatars/2.png') },
  { id: 4, source: require('../../../assets/avatars/3.png') },
  { id: 5, source: require('../../../assets/avatars/4.png') },
];

export default function AccountInformation() {
  const router = useRouter();
  
  // States para sa user info at avatar replacement
  const [firstName, setFirstName] = useState('Maria Clara');
  const [lastName, setLastName] = useState('Alba');
  const [age, setAge] = useState('24');
  const [email, setEmail] = useState('mariaclara@gmail.com');
  const [currentAvatar, setCurrentAvatar] = useState(availableAvatars[0].source);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSave = () => {
    Alert.alert(
      "Success", 
      "Your information has been updated!",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const handleAvatarSelect = (newSource) => {
    setCurrentAvatar(newSource);
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      
      {/* HEADER ROW - No background on back button */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image 
            source={require('../../../assets/icons/backArrow.png')} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* AVATAR SECTION - Replaceable */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image source={currentAvatar} style={styles.avatarImg} />
            <TouchableOpacity 
              style={styles.editBadge} 
              onPress={() => setIsModalVisible(true)}
            >
              <Image 
                source={require('../../../assets/icons/edit_icon.png')} 
                style={styles.editIcon} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.changeText}>Tap to change avatar</Text>
        </View>

        {/* FORM SECTION - Yellow Rounded Container */}
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
            <Text style={styles.fieldLabel}>Age</Text>
            <TextInput 
              style={styles.textInput} 
              value={age} 
              onChangeText={setAge} 
              keyboardType="numeric" 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput 
              style={styles.textInput} 
              value={email} 
              onChangeText={setEmail} 
              autoCapitalize="none" 
            />
          </View>

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
                  onPress={() => handleAvatarSelect(item.source)}
                  style={[
                    styles.avatarOption,
                    currentAvatar === item.source && styles.activeAvatarOption
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
    </SafeAreaView>
  );
}