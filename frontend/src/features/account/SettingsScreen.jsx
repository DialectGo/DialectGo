import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View, } from 'react-native';
import { styles } from './styles/SettingsStyles';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../components/ProfileTopBar';
import ProfileMenuItem from '../../shared/components/profile/ProfileMenuItem';

export default function SettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // guide, terms, privacy

  const handlePress = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />

      <ProfileTopBar title="Settings" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={{ marginTop: 20 }}>
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/help_icon.png')} 
            text="How to Use"
            onPress={() => handlePress('guide')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/terms_icon.png')} 
            text="Terms and Conditions"
            onPress={() => handlePress('terms')}
          />
          <ProfileMenuItem 
            iconSource={require('../../../assets/icons/profile/privacy_icon.png')} 
            text="Privacy Policy"
            onPress={() => handlePress('privacy')}
          />
        </View>

        <Text style={styles.versionText}>DialectGo Version 1.0.4</Text>
      </ScrollView>

      {/* MODAL */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'guide' ? 'How to Use' : modalType === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
            </Text>
            
            <ScrollView style={styles.modalBodyScroll}>
              <Text style={styles.modalBodyText}>
                {modalType === 'guide' && "1. Open the Home tab to start translating.\n2. Select your target language (Tagalog or Cebuano).\n3. Speak or type to see instant results."}
                {modalType === 'terms' && "By using DialectGo, you agree to follow our community guidelines and respect intellectual property rights in translations."}
                {modalType === 'privacy' && "We value your privacy. Your translation history is stored locally and we do not sell your personal data to third parties."}
              </Text>
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}