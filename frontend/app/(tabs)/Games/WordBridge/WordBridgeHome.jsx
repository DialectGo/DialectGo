import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import {
  Modal,
  
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../WordBridge/WordBridgeStyles';
import { supabase } from '../../../../shared/lib/supabase';

import { API_API_BASE } from '../../../../shared/config/apiConfig';
const API_URL = API_API_BASE;

export default function WordBridgeHome() {
  const router = useRouter();
  
  // DYNAMIC LEVEL TRACKING STATE
  const [completedLevels, setCompletedLevels] = useState([]);
  
  // NAVIGATION STATES
  const [viewState, setViewState] = useState('home'); 
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [gameMode, setGameMode] = useState(''); // 'Cebuano - Tagalog' or 'Cebuano - English'

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);

  const totalLevels = 24; 
  const levels = Array.from({ length: totalLevels }, (_, i) => i + 1);

  // Fetch the latest progression from your backend database
  const fetchUserProgression = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // FIXED: Points to the unified profile progression route path
      const response = await fetch(`${API_URL}/progress/me?game_id=2&difficulty=hard`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await response.json();

      if (result.success && result.data) {
        const key = `wordbridge_completed_levels_${session.user.id}_hard`;
        const saved = await AsyncStorage.getItem(key);
        setCompletedLevels(saved ? JSON.parse(saved) : (Array.isArray(result.data.completed_levels) ? result.data.completed_levels : []));
      }
    } catch (error) {
      console.error("Failed syncing WordBridge progression index logs:", error);
    }
  };

  // Triggers automatically whenever the user focuses back to the screen from a game session
  useFocusEffect(
    useCallback(() => {
      fetchUserProgression();
    }, [])
  );

  const handleBackPress = () => {
    if (viewState === 'levels') setViewState('home');
    else router.back();
  };

  const selectModeAndProceed = (mode) => {
    setGameMode(mode);
    setShowLanguagePicker(false);
    setViewState('levels');
  };

  const startGameEngineInstance = async (lvl) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.access_token) {
        Alert.alert("Authentication Session Expired", "Please authenticate credentials to join tracking logs.");
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ game_id: 2 })
      });
      
      const resData = await response.json();
      
      if (response.ok && resData.success && resData.data) {
        // MATCH LOGIC: Extract target language dynamically based on what was picked
        // If mode is 'Cebuano - Tagalog', target language context is 'tagalog'
        const targetLangParam = gameMode.toLowerCase().includes('tagalog') ? 'english' : 'tagalog';

        router.push({
          pathname: '/Games/WordBridge/WordBridgeGame',
          params: { 
            initialLevel: lvl, 
            gameMode: gameMode,
            targetLanguage: targetLangParam, // <-- PASSES TRANSLATION PREFERENCE
            sessionId: resData.data.session_id
          }
        });
      } else {
        Alert.alert("Session Error", resData.message || "Could not spin up tracking nodes.");
      }
    } catch (error) {
      console.error("Critical handshake failure on WordBridge initiation path:", error);
      Alert.alert("Network Timeout", "Could not verify device telemetry with processing server target endpoints.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* --- MODAL: LANGUAGE PICKER --- */}
      <Modal animationType="fade" transparent visible={showLanguagePicker}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '85%' }]}>
            <Text style={[styles.modalTitle, { marginBottom: 25 }]}>PUMILI NG MODE</Text>
            
            <View style={{ width: '100%', gap: 15 }}>
              <TouchableOpacity 
                style={localStyles.langCard} 
                onPress={() => selectModeAndProceed('Cebuano - English')}
              >
                <Ionicons name="swap-horizontal" size={24} color="#FF9800" style={{ marginBottom: 5 }} />
                <Text style={localStyles.langLabel}>Cebuano - English</Text>
                <Text style={localStyles.subLabel}>Vice Versa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={localStyles.langCard} 
                onPress={() => selectModeAndProceed('Cebuano - Tagalog')}
              >
                <Ionicons name="swap-horizontal" size={24} color="#FF9800" style={{ marginBottom: 5 }} />
                <Text style={localStyles.langLabel}>Cebuano - Tagalog</Text>
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
              <Ionicons name="git-commit-outline" size={120} color="#FF9800" />
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
                // ✅ FIXED LEVEL VALIDATION MATRIX RULES LIKE WORDMATCHER
                const isCompleted = completedLevels.includes(lvl);
                const isLocked = lvl !== 1 && !completedLevels.includes(lvl - 1);

                return (
                  <TouchableOpacity
                    key={lvl}
                    disabled={isLocked}
                    onPress={() => startGameEngineInstance(lvl)}
                    style={[
                      styles.levelBtn, 
                      isLocked ? styles.lockedLevel : (isCompleted ? [styles.completedLevel, { backgroundColor: '#4CAF50' }] : styles.currentLevel)
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