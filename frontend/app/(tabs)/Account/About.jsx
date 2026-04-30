import React, { useState } from 'react';
import { Image, Modal, ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../../shared/styles/SettingsStyles';
import { useRouter } from 'expo-router'; // 1. I-import ang useRouter

export default function Settings() { // Alisin ang onNavigate prop
  const router = useRouter(); // 2. I-initialize ang router
  const [isNotifEnabled, setIsNotifEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); 

  const toggleNotif = () => setIsNotifEnabled(previousState => !previousState);

  const handlePress = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const SettingItem = ({ icon, title, subtitle, type = 'arrow', value, onValueChange, color, onPress }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
           <Image source={icon} style={{ width: 20, height: 20, tintColor: color }} />
        </View>
        <View>
          <Text style={styles.menuText}>{title}</Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      </View>
      
      {type === 'arrow' && (
        <Image source={require('../../../assets/icons/forward_arrow.png')} style={styles.arrowIcon} />
      )}
      {type === 'switch' && (
        <Switch
          trackColor={{ false: "#D1D1D1", true: "#FFD54F" }}
          thumbColor={value ? "#FFF" : "#F4F3F4"}
          onValueChange={onValueChange}
          value={value}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />

      {/* HEADER */}
      <View style={styles.header}>
        {/* 3. Gamitin ang router.back() sa halip na onNavigate */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image source={require('../../../assets/icons/back_arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PREFERENCES */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.menuCard}>
            <SettingItem 
              icon={require('../../../assets/icons/language_icon.png')} 
              title="App Language" 
              subtitle={selectedLanguage}
              color="#2196F3"
              onPress={() => handlePress('language')}
            />
            <SettingItem 
              icon={require('../../../assets/icons/notif_icon.png')} 
              title="Push Notifications" 
              type="switch" 
              value={isNotifEnabled}
              onValueChange={toggleNotif}
              color="#FF8F00"
            />
          </View>
        </View>

        {/* GUIDES */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Guides & Help</Text>
          <View style={styles.menuCard}>
            <SettingItem 
              icon={require('../../../assets/icons/help_icon.png')} 
              title="How to Use DialectGo" 
              subtitle="Learn the basics of the app"
              color="#9C27B0"
              onPress={() => handlePress('guide')}
            />
          </View>
        </View>

        {/* SUPPORT */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support & Legal</Text>
          <View style={styles.menuCard}>
            <SettingItem 
              icon={require('../../../assets/icons/info_icon.png')} 
              title="Privacy Policy" 
              color="#4CAF50"
              onPress={() => handlePress('privacy')}
            />
            <SettingItem 
              icon={require('../../../assets/icons/logout_icon.png')} 
              title="Clear Cache" 
              color="#D32F2F"
              onPress={() => handlePress('cache')}
            />
          </View>
        </View>

        <Text style={styles.versionText}>DialectGo Version 1.0.4</Text>
      </ScrollView>

      {/* --- UNIVERSAL MODAL (REMAINS THE SAME) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* CONTENT: LANGUAGE */}
            {modalType === 'language' && (
              <>
                <Text style={styles.modalTitle}>App Language</Text>
                {['English', 'Tagalog', 'Cebuano'].map((lang) => (
                  <TouchableOpacity 
                    key={lang} 
                    style={styles.modalOption} 
                    onPress={() => { setSelectedLanguage(lang); setModalVisible(false); }}
                  >
                    <Text style={[styles.optionText, selectedLanguage === lang && { color: '#FFB300' }]}>{lang}</Text>
                    {selectedLanguage === lang && <View style={styles.activeDot} />}
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* ... other modal contents (guide, privacy, cache) ... */}

            {modalType !== 'cache' && (
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtnText}>CLOSE</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}