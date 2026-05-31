import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './WordMatcherStyles';

// 1. IMPORT YOUR EXISTING SUPABASE CLIENT INSTANCE
import { supabase } from '../../../../shared/lib/supabase'; // Adjust this path match relative to your directory structure

const API_URL = 'http://192.168.1.53:5001/api';

export default function WordMatcherHome({ route }) {
  const router = useRouter();
  
  const [viewState, setViewState] = useState('home'); 
  const [selectedDifficulty, setSelectedDifficulty] = useState(null); 
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  const levels = Array.from({ length: 24 }, (_, i) => i + 1);

  // 2. UPDATED REMOTE PROGRESS HOOK TO USE SUPABASE SESSION
  useFocusEffect(
    useCallback(() => {
      const loadRemoteProgress = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const response = await fetch(`${API_URL}/progress/me`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          const result = await response.json();
          if (result.success && result.data) {
            const saved = await AsyncStorage.getItem(`completed_levels_${selectedDifficulty}`);
            if (saved !== null) {
              setCompletedLevels(JSON.parse(saved));
            }
          }
        } catch (e) {
          console.error("Failed to load progress from server", e);
        }
      };
      if (selectedDifficulty) loadRemoteProgress();
    }, [selectedDifficulty])
  );

  const handleBackPress = () => {
    if (viewState === 'levels') {
      setViewState('difficulty');
    } else if (viewState === 'difficulty') {
      setViewState('home');
    } else {
      router.back();
    }
  };

  const handleDifficultySelect = (diff) => {
    setSelectedDifficulty(diff);
    setViewState('levels');
  };

  // 3. UPDATED START GAME METHOD WITH SUPABASE SESSION INTEGRATION
  const startGame = async (lvl) => {
    setLoading(true);
    try {
      // Fetch token directly from Supabase client just like Dictionary.jsx does
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.access_token) {
        Alert.alert("Authentication Required", "No active user session found. Please re-login.");
        setLoading(false);
        return;
      }
      
      console.log("Supabase session token verified. Initiating game payload...");

      const response = await fetch(`${API_URL}/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ game_id: 1 }) 
      });
      
      const responseText = await response.text();
      
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        console.error("Backend returned an HTML error screen instead of JSON:", responseText);
        Alert.alert("Server Error", "Backend configuration mismatch. Check your server logs.");
        setLoading(false);
        return;
      }

      const resData = JSON.parse(responseText);
      
      if (response.ok && resData.success && resData.data) {
        router.push({
          pathname: '/Games/WordMatcher/WordMatcherGame',
          params: { 
            initialLevel: lvl, 
            difficulty: selectedDifficulty,
            sessionId: resData.data.session_id
          }
        });
      } else {
        Alert.alert("Game Error", resData.message || "Failed to establish game session.");
      }
    } catch (error) {
      console.error("Error starting game session:", error);
      Alert.alert("Connection Failure", "Could not reach target host destination server.");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#421C00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFF9E1" barStyle="dark-content" />

      {/* HEADER AREA */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 }}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back-circle" size={45} color="#421C00" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={[styles.gameTitle, { fontSize: 18 }]}>
            {viewState === 'levels' ? `${selectedDifficulty?.toUpperCase()} LEVELS` : 
            viewState === 'difficulty' ? "SELECT DIFFICULTY" : "WORD MATCHER"}
            </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}>
        
        {/* LOGO AREA */}
        <View style={styles.logoContainer}>
          <Ionicons 
            name={viewState === 'levels' ? "trophy" : "extension-puzzle"} 
            size={viewState === 'levels' ? 70 : 100} 
            color={viewState === 'levels' ? "#FFD54F" : "#421C00"} 
          />
          {viewState === 'home' && <Text style={styles.gameTitle}>READY TO{'\n'}PLAY?</Text>}
        </View>

        {/* VIEW 1: HOME MENU */}
        {viewState === 'home' && (
          <View style={styles.menuWrapper}>
            <TouchableOpacity style={styles.mainButton} onPress={() => setViewState('difficulty')}>
              <Ionicons name="play" size={28} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>START GAME</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowHowToPlay(true)}>
              <Text style={styles.secondaryButtonText}>HOW TO PLAY</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* VIEW 2: DIFFICULTY SELECTION */}
        {viewState === 'difficulty' && (
          <View style={styles.menuWrapper}>
            <TouchableOpacity 
              style={[styles.mainButton, { backgroundColor: '#4CAF50', marginBottom: 15 }]} 
              onPress={() => handleDifficultySelect('easy')}
            >
              <Text style={styles.buttonText}>EASY</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.mainButton, { backgroundColor: '#FF9800', marginBottom: 15 }]} 
              onPress={() => handleDifficultySelect('medium')}
            >
              <Text style={styles.buttonText}>MEDIUM</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.mainButton, { backgroundColor: '#F44336' }]} 
              onPress={() => handleDifficultySelect('hard')}
            >
              <Text style={styles.buttonText}>HARD</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* VIEW 3: LEVEL GRID */}
        {viewState === 'levels' && (
          <View style={styles.levelWrapper}>
            <View style={styles.levelGrid}>
              {levels.map((lvl) => {
                const isCompleted = completedLevels.includes(lvl);
                const isLocked = lvl !== 1 && !completedLevels.includes(lvl - 1);

                return (
                  <TouchableOpacity
                    key={lvl}
                    disabled={isLocked}
                    onPress={() => startGame(lvl)} 
                    style={[
                      styles.levelBtn, 
                      isCompleted ? { backgroundColor: '#4CAF50' } : (isLocked ? styles.lockedLevel : styles.currentLevel)
                    ]}
                  >
                    {isLocked ? (
                      <Ionicons name="lock-closed" size={20} color="#FFF" />
                    ) : (
                      <Text style={styles.levelNumber}>{lvl}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* HOW TO PLAY MODAL */}
      <Modal visible={showHowToPlay} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>HOW TO PLAY</Text>
            <Text style={{ textAlign: 'center', marginVertical: 15, lineHeight: 20 }}>
              Match the given Cebuano word or sentence with its correct translation choice. 
              Complete a level to unlock the next one. Don't lose all your hearts!
            </Text>
            <TouchableOpacity style={styles.mainButton} onPress={() => setShowHowToPlay(false)}>
              <Text style={styles.buttonText}>GOT IT!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}