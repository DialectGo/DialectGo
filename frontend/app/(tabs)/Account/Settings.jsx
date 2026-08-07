import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View, } from 'react-native';
import { styles } from '../../../shared/styles/SettingsStyles';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../../shared/components/ProfileTopBar';

export default function Settings() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // guide, terms, privacy

  const handlePress = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const SettingItem = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={styles.iconCircle}>
           <Image source={icon} style={styles.itemIcon} />
        </View>
        <View>
          <Text style={styles.menuText}>{title}</Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      </View>
      <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />

      <ProfileTopBar title="Settings" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
        <View style={styles.topSpacer} />
        
        {/* YELLOW BUBBLY CONTAINER */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionLabel}>Information & Legal</Text>
          
          <View style={styles.menuCard}>
            <SettingItem 
              icon={require('../../../assets/icons/help_icon.png')} 
              title="How to Use" 
              subtitle="Learn the basics of DialectGo"
              onPress={() => handlePress('guide')}
            />
            <SettingItem 
              icon={require('../../../assets/icons/terms_icon.png')} 
              title="Terms and Conditions" 
              subtitle="Usage rules and agreements"
              onPress={() => handlePress('terms')}
            />
            <SettingItem 
              icon={require('../../../assets/icons/privacy_icon.png')} 
              title="Privacy Policy" 
              subtitle="How we protect your data"
              onPress={() => handlePress('privacy')}
            />
          </View>

          <Text style={styles.versionText}>DialectGo Version 1.0.4</Text>
        </View>
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