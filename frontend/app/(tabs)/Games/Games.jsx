import React, { useState, useEffect, useCallback } from 'react';
import { Platform, ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../src/shared/api/supabase';
import { API_BASE_URL } from '../../../src/shared/api/client';

import BottomNav from '../../../src/components/BottomNav';
import TopBar from '../../../src/components/TopBar';
import { styles } from '../../../src/features/games/styles/GamesStyles';

const API_URL = `${API_BASE_URL}/api`;

export default function Games({ activeTab, onNavigate }) {
  const forcedActiveTab = "Games";
  const router = useRouter();

  // Dashboard Stats States
  const [xp, setXp] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [hearts, setHearts] = useState(8); 
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch real-time progress values when user navigates to the screen
  useFocusEffect(
    useCallback(() => {
      async function loadUserStats() {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            setXp(0);
            setHighScore(0);
            setHearts(8);
            setLoadingStats(false);
            return;
          }

          const res = await fetch(`${API_URL}/progress/me?game_id=0&difficulty=global`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          const result = await res.json();

          if (result.success && result.data) {
            setXp(Number(result.data.total_xp || 0));
            setHighScore(Number(result.data.high_score || 0));
            setHearts(Number(result.data.current_hearts || 8));
          } else {
            setXp(0);
            setHighScore(0);
            setHearts(8);
          }
        } catch (err) {
          console.error("Error loading centralized game stats:", err);
          setXp(0);
          setHighScore(0);
          setHearts(8);
        } finally {
          setLoadingStats(false);
        }
      }
      loadUserStats();
    }, [])
  );

  // Helper utility tracking session initialization pipelines
  const handleStartGameSession = async (gameId, targetUrl) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ game_id: gameId })
      });
      const result = await response.json();
      if (result.success) {
        router.push(`${targetUrl}?sessionId=${result.data.session_id}`);
      }
    } catch (error) {
      console.error("Failed creating dynamic game tracking session:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <TopBar onMenuPress={() => console.log("Menu Pressed!")} />

      {/* ✅ FIXED STATS BAR HEADER: Removed the extra hardcoded marginTop gaps */}
      <View style={{
        flexDirection: 'row', 
        backgroundColor: '#FFFDE7', 
        paddingVertical: 12, 
        paddingHorizontal: 20, 
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#FFD54F',
        marginTop: 0 // Cleaned up layout to sit flush below TopBar
      }}>
        <Text style={{ fontSize: 13, fontWeight: '900', color: '#421C00' }}>🏆 HIGH SCORE: {highScore}</Text>
        <Text style={{ fontSize: 13, fontWeight: '900', color: '#F44336' }}>❤️ LIVES: {hearts}/8</Text>
        <Text style={{ fontSize: 13, fontWeight: '900', color: '#FF9800' }}>⭐ XP: {xp}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.textContainerHeader}>
              <Text style={styles.headerTitle}>
                Dialect <Text style={styles.yellowText}>Playground</Text>
              </Text>
              <View style={styles.titleUnderline} />
            </View>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeSub}>
              Master Cebuano and Tagalog through fun challenges.
            </Text>
          </View>

          {/* Word Bridge Card */}
          <View style={[styles.gameCard, { borderLeftColor: '#FF9800', borderLeftWidth: 8 }]}>
            <View style={styles.cardInfo}>
              <View style={[styles.iconBox, { backgroundColor: '#FF980020' }]}>
                <Text style={{ fontSize: 30 }}>🌉</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.gameTitle}>Word Bridge</Text>
                <Text style={styles.gameDesc}>Connect words to form meaningful sentences.</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.getBtn, { backgroundColor: '#FF9800' }]}
              onPress={() => handleStartGameSession(2, '/Games/WordBridge/WordBridgeHome')} 
              activeOpacity={0.8}
            >
              <Text style={styles.getBtnText}>GET STARTED</Text>
            </TouchableOpacity>
          </View>

          {/* Word Matcher Card */}
          <View style={[styles.gameCard, { borderLeftColor: '#2196F3', borderLeftWidth: 8 }]}>
            <View style={styles.cardInfo}>
              <View style={[styles.iconBox, { backgroundColor: '#2196F320' }]}>
                <Text style={{ fontSize: 30 }}>🧩</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.gameTitle}>Word Matcher</Text>
                <Text style={styles.gameDesc}>Match words in different languages to improve your vocabulary.</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.getBtn, { backgroundColor: '#2196F3' }]}
              onPress={() => handleStartGameSession(1, '/Games/WordMatcher/WordMatcherHome')}
              activeOpacity={0.8}
            >
              <Text style={styles.getBtnText}>GET STARTED</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>More games coming soon...</Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav activeTab={forcedActiveTab} setActiveTab={onNavigate} />
    </View>
  );
}