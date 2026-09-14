import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles/SettingsStyles';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../components/ProfileTopBar';
import ProfileMenuItem from '../../shared/components/profile/ProfileMenuItem';
import {
  HOW_TO_USE_STEPS,
  TERMS_AND_CONDITIONS_SECTIONS,
  PRIVACY_POLICY_TEXT,
} from '../../constants/legalContent';

const MODAL_TITLES = {
  guide: 'How to Use',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
};

/**
 * Renders the terms & conditions as a list of headed sections rather than
 * one undifferentiated block of text, so a multi-paragraph legal doc is
 * actually scannable inside a modal.
 */
const TermsAndConditionsContent = () => (
  <>
    {TERMS_AND_CONDITIONS_SECTIONS.map((section) => (
      <View key={section.heading} style={legalStyles.section}>
        <Text style={legalStyles.sectionHeading}>{section.heading}</Text>
        <Text style={legalStyles.sectionBody}>{section.body}</Text>
      </View>
    ))}
  </>
);

export default function SettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'guide' | 'terms' | 'privacy' | null

  const handlePress = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setModalType(null);
  };

  const renderModalBody = () => {
    switch (modalType) {
      case 'guide':
        return HOW_TO_USE_STEPS.map((step) => (
          <Text key={step} style={styles.modalBodyText}>
            {step}
          </Text>
        ));
      case 'terms':
        return <TermsAndConditionsContent />;
      case 'privacy':
        return <Text style={styles.modalBodyText}>{PRIVACY_POLICY_TEXT}</Text>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />

      <ProfileTopBar title="Settings" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={{ marginTop: 20 }}>
          <ProfileMenuItem
            iconSource={require('../../../assets/icons/profile/settings/how_to_use_icon.png')}
            text="How to Use"
            onPress={() => handlePress('guide')}
          />
          <ProfileMenuItem
            iconSource={require('../../../assets/icons/profile/settings/terms_and_conditions_icon.png')}
            text="Terms and Conditions"
            onPress={() => handlePress('terms')}
          />
          <ProfileMenuItem
            iconSource={require('../../../assets/icons/profile/settings/privacy_policy_icon.png')}
            text="Privacy Policy"
            onPress={() => handlePress('privacy')}
          />
        </View>

        <Text style={styles.versionText}>DialectGo Version 1.0.4</Text>
      </ScrollView>

      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalType ? MODAL_TITLES[modalType] : ''}</Text>

            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
              {renderModalBody()}
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// TODO for you: fold these into SettingsStyles.js so all screen styling lives
// in one place — kept local here since I don't have that file's contents.
const legalStyles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1A1A1A',
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3A3A3A',
  },
});