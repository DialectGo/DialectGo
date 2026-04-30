import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '../WordBridge/WordBridgeStyles';

export default function WordBridgeHome({ unlockedLevel = 1 }) {
  const router = useRouter();
  
  // NAVIGATION STATES
  const [viewState, setViewState] = useState('home'); 
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  
  // Configuration: Ngayon dalawa na lang ang mode
  const [gameMode, setGameMode] = useState(''); // 'ceb-tag' or 'ceb-eng'

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);

  const totalLevels = 50; 
  const levels = Array.from({ length: totalLevels }, (_, i) => i + 1);

  const handleBackPress = () => {
    if (viewState === 'levels') setViewState('home');
    else router.back();
  };

  const selectModeAndProceed = (mode) => {
    setGameMode(mode);
    setShowLanguagePicker(false);
    setViewState('levels');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* --- MODAL: LANGUAGE PICKER (2 CHOICES ONLY) --- */}
      <Modal animationType="fade" transparent visible={showLanguagePicker}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '85%' }]}>
            <Text style={[styles.modalTitle, { marginBottom: 25 }]}>PUMILI NG MODE</Text>
            
            <View style={{ width: '100%', gap: 15 }}>
              {/* CHOICE 1: CEBUANO - TAGALOG */}
              <TouchableOpacity 
                style={localStyles.langCard} 
                onPress={() => selectModeAndProceed('Cebuano - Tagalog')}
              >
                <Ionicons name="swap-horizontal" size={24} color="#FF9800" style={{ marginBottom: 5 }} />
                <Text style={localStyles.langLabel}>Cebuano - Tagalog</Text>
                <Text style={localStyles.subLabel}>Vice Versa</Text>
              </TouchableOpacity>
              
              {/* CHOICE 2: CEBUANO - ENGLISH */}
              <TouchableOpacity 
                style={localStyles.langCard} 
                onPress={() => selectModeAndProceed('Cebuano - English')}
              >
                <Ionicons name="swap-horizontal" size={24} color="#FF9800" style={{ marginBottom: 5 }} />
                <Text style={localStyles.langLabel}>Cebuano - English</Text>
                <Text style={localStyles.subLabel}>Vice Versa</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={{ marginTop: 25 }} onPress={() => setShowLanguagePicker(false)}>
              <Text style={{ color: '#90A4AE', fontWeight: '800' }}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: HOW TO PLAY --- */}
      <Modal animationType="slide" transparent visible={showHowToPlay}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="construct" size={60} color="#FF9800" />
            <Text style={styles.modalTitle}>HOW TO PLAY</Text>
            <View style={{ marginVertical: 20, width: '100%', gap: 12 }}>
              <Text style={styles.instructionText}>• Ayusin ang mga salita para makabuo ng tulay.</Text>
              <Text style={styles.instructionText}>• I-tap ang tamang translation sequence.</Text>
              <Text style={styles.instructionText}>• Vice Versa: Pwedeng Cebuano to Tagalog/English o pabalik!</Text>
            </View>
            <TouchableOpacity 
              style={[styles.mainButton, { backgroundColor: '#FF9800' }]} 
              onPress={() => setShowHowToPlay(false)}
            >
              <Text style={styles.buttonText}>GOT IT!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: SETTINGS --- */}
      <Modal animationType="fade" transparent visible={showSettings}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ alignSelf: 'flex-end' }}>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close-circle" size={30} color="#421C00" />
              </TouchableOpacity>
            </View>
            <Ionicons name="settings" size={50} color="#FF9800" />
            <Text style={styles.modalTitle}>SETTINGS</Text>
            <View style={{ width: '100%', marginVertical: 20, gap: 15 }}>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Sound Effects</Text>
                <Switch value={isSoundEnabled} onValueChange={setIsSoundEnabled} trackColor={{ true: "#FF9800" }} />
              </View>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Music</Text>
                <Switch value={isMusicEnabled} onValueChange={setIsMusicEnabled} trackColor={{ true: "#FF9800" }} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- HEADER --- */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 }}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back-circle" size={45} color="#421C00" />
        </TouchableOpacity>
        <View style={{ marginLeft: 15 }}>
          <Text style={[styles.gameTitle, { fontSize: 20 }]}>
            {viewState === 'levels' ? "SELECT LEVEL" : "WORD BRIDGE"}
          </Text>
          {viewState === 'levels' && (
            <Text style={{ fontSize: 12, color: '#FF9800', fontWeight: 'bold' }}>
              MODE: {gameMode}
            </Text>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        
        {/* --- VIEW 1: HOME --- */}
        {viewState === 'home' && (
          <View style={[styles.menuWrapper, { marginTop: 60 }]}>
            <View style={{ alignItems: 'center', marginBottom: 50 }}>
              <Ionicons name="bridge" size={120} color="#FF9800" />
              <Text style={[styles.headerTitle, { textAlign: 'center', fontSize: 38 }]}>
                DIALECT{'\n'}<Text style={styles.yellowText}>BRIDGE</Text>
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.mainButton, { backgroundColor: '#FF9800', height: 75 }]} 
              onPress={() => setShowLanguagePicker(true)}
            >
              <Ionicons name="play" size={32} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={[styles.buttonText, { fontSize: 26 }]}>PLAY NOW</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', marginTop: 30, gap: 25 }}>
               <TouchableOpacity onPress={() => setShowHowToPlay(true)}>
                  <Ionicons name="help-circle-outline" size={38} color="#421C00" />
               </TouchableOpacity>

               <TouchableOpacity onPress={() => setShowSettings(true)}>
                  <Ionicons name="settings-outline" size={35} color="#421C00" />
               </TouchableOpacity>
            </View>
          </View>
        )}

        {/* --- VIEW 2: LEVEL GRID --- */}
        {viewState === 'levels' && (
          <View style={[styles.levelWrapper, { marginTop: 20 }]}>
            <View style={styles.levelGrid}>
              {levels.map((lvl) => {
                const currentUnlocked = Number(unlockedLevel) || 1;
                const isLocked = lvl > currentUnlocked;
                const isCompleted = lvl < currentUnlocked;

                return (
                  <TouchableOpacity
                    key={lvl}
                    disabled={isLocked}
                    onPress={() => console.log(`Start Level ${lvl} - ${gameMode}`)}
                    style={[
                      styles.levelBtn, 
                      isLocked ? styles.lockedLevel : (isCompleted ? styles.completedLevel : styles.currentLevel)
                    ]}
                  >
                    {isLocked ? (
                      <Ionicons name="lock-closed" size={22} color="#B0BEC5" />
                    ) : (
                      <View style={{ alignItems: 'center' }}>
                         {isCompleted && <Ionicons name="star" size={12} color="#FFD600" style={{ marginBottom: -2 }} />}
                         <Text style={[styles.levelNumber, { color: isCompleted ? '#FFF' : '#E65100' }]}>{lvl}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  langCard: {
    backgroundColor: '#FFF8E1',
    padding: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFE082',
    alignItems: 'center',
    width: '100%',
    elevation: 3,
  },
  langLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#421C00',
  },
  subLabel: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  }
});