import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles/SettingsStyles';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../components/ProfileTopBar';
import ProfileMenuItem from '../../shared/components/profile/ProfileMenuItem';
import {
  HOW_TO_USE_SECTIONS,
  TERMS_AND_CONDITIONS_SECTIONS,
  PRIVACY_POLICY_SECTIONS,
} from '../../constants/legalContent';

const MODAL_TITLES = {
  guide: 'How to Use',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
};

const SectionedLegalContent = ({ sections }) => (
  <>
    {sections.map((section, index) => (
      <View key={section.heading}>
        <View style={legalStyles.section}>
          <View style={legalStyles.headingRow}>
            <View style={legalStyles.badge}>
              <Text style={legalStyles.badgeText}>{index + 1}</Text>
            </View>
            <Text style={legalStyles.sectionHeading}>{section.heading}</Text>
          </View>
          <Text style={legalStyles.sectionBody}>{section.body}</Text>
        </View>
        {index < sections.length - 1 && <View style={legalStyles.divider} />}
      </View>
    ))}
  </>
);

const SectionedGuideContent = ({ sections }) => (
  <>
    {sections.map((section, sectionIndex) => (
      <View key={section.heading}>
        <View style={legalStyles.section}>
          <View style={legalStyles.headingRow}>
            <View style={legalStyles.badge}>
              <Text style={legalStyles.badgeText}>{sectionIndex + 1}</Text>
            </View>
            <Text style={legalStyles.sectionHeading}>{section.heading}</Text>
          </View>

          {section.steps.map((step, stepIndex) => (
            <View key={step.label} style={legalStyles.stepRow}>
              <View style={legalStyles.stepDot}>
                <Text style={legalStyles.stepDotText}>{stepIndex + 1}</Text>
              </View>
              <Text style={legalStyles.stepText}>
                <Text style={legalStyles.stepLabel}>{step.label}: </Text>
                {step.description}
              </Text>
            </View>
          ))}
        </View>
        {sectionIndex < sections.length - 1 && <View style={legalStyles.divider} />}
      </View>
    ))}
  </>
);

export default function SettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); 
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
        return <SectionedGuideContent sections={HOW_TO_USE_SECTIONS} />;
      case 'terms':
        return <SectionedLegalContent sections={TERMS_AND_CONDITIONS_SECTIONS} />;
      case 'privacy':
        return <SectionedLegalContent sections={PRIVACY_POLICY_SECTIONS} />;
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

        <Text style={styles.versionText}>DialectGo Version 1.8.5</Text>
      </ScrollView>

      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, legalStyles.modalContentOverride]}>
            <View style={legalStyles.headerRow}>
              <Text style={[styles.modalTitle, legalStyles.headerTitle]} numberOfLines={1}>
                {modalType ? MODAL_TITLES[modalType] : ''}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={legalStyles.closeIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={legalStyles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={legalStyles.headerAccent} />

            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
              {renderModalBody()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const legalStyles = StyleSheet.create({
  modalContentOverride: {
    maxHeight: '80%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  closeIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF3CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#421C00',
  },
  headerAccent: {
    height: 3,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 14,
    width: 48,
  },
  section: {
    paddingVertical: 14,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#421C00',
  },
  sectionHeading: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3A3A3A',
    marginLeft: 34, // aligns under heading text, past the badge
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 34,
    marginBottom: 8,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  stepDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#421C00',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#3A3A3A',
  },
  stepLabel: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5D9B8', // muted warm gray, sits quietly against the amber theme
    marginVertical: 4,
  },
});