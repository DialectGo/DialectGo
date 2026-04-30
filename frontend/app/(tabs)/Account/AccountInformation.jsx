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
  View
} from 'react-native';
import { styles } from '../../../shared/styles/AccountStyles';
import { useRouter } from 'expo-router';

// Listahan ng mga avatars - Siguraduhin na tama ang mga paths na ito
const availableAvatars = [
  { id: 1, source: require('../../../assets/avatars/maria_clara.png') },
  { id: 2, source: require('../../../assets/avatars/1.png') },
  { id: 3, source: require('../../../assets/avatars/2.png') },
  { id: 4, source: require('../../../assets/avatars/3.png') },
  { id: 5, source: require('../../../assets/avatars/4.png') },
];

export default function AccountInformation() {
  const router = useRouter();
  
  // FORM STATES
  const [firstName, setFirstName] = useState('Maria Clara');
  const [lastName, setLastName] = useState('Alba');
  const [age, setAge] = useState('24');
  const [email, setEmail] = useState('mariaclara@gmail.com');

  // AVATAR STATES
  const [currentAvatar, setCurrentAvatar] = useState(availableAvatars[0].source);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // LOGIC PARA SA PAG-SAVE
  const handleSave = () => {
    // Dito pwedeng mag-insert ng logic para i-update ang global state o database sa future
    console.log("Saved Info:", { firstName, lastName, age, email });

    Alert.alert(
      "Success", 
      "Your information has been updated!",
      [
        { 
          text: "OK", 
          onPress: () => router.back() // FIXED: Babalik sa Profile page gamit ang expo-router
        }
      ]
    );
  };

  const handleAvatarSelect = (newSource) => {
    setCurrentAvatar(newSource);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        {/* FIXED: Back button using router.back() */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image 
            source={require('../../../assets/icons/back_arrow.png')} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Image source={currentAvatar} style={styles.avatarImg} />
          </View>
          <TouchableOpacity 
            style={styles.editAvatarBtn} 
            onPress={() => setIsModalVisible(true)}
          >
            <Image 
              source={require('../../../assets/icons/edit_icon.png')} 
              style={styles.editIcon} 
            />
          </TouchableOpacity>
        </View>

        {/* FORM SECTION */}
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>First Name</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.textInput} 
              value={firstName} 
              onChangeText={setFirstName} 
            />
          </View>

          <Text style={styles.inputLabel}>Last Name</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.textInput} 
              value={lastName} 
              onChangeText={setLastName} 
            />
          </View>

          <Text style={styles.inputLabel}>Age</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.textInput} 
              value={age} 
              onChangeText={setAge} 
              keyboardType="numeric" 
            />
          </View>

          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.textInput} 
              value={email} 
              onChangeText={setEmail} 
              autoCapitalize="none" 
            />
          </View>

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Information</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AVATAR SELECTION MODAL */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Avatar</Text>
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
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}