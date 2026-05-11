import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../shared/lib/supabase';
import BottomNav from '../../shared/components/BottomNav';
import TopBar from '../../shared/components/TopBar';
import { styles } from '../../shared/styles/HomeStyles';

const API_BASE_URL = 'http://192.168.1.53:5001/api/dictionary/word-of-the-day';

export default function Home({ onNavigate, activeTab }) {
  const [wordOfDay, setWordOfDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyWord();
  }, []);

  const fetchDailyWord = async () => {
  try {
    // 1. Get session FIRST to identify the user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    const userId = session.user.id;
    // CRITICAL: Use the same unique key for both reading and writing
    const storageKey = `word_of_the_day_${userId}`; 
    const now = Date.now();

    // 2. Check the user-specific cache
    const storedData = await AsyncStorage.getItem(storageKey);

    if (storedData) {
      const { data, timestamp } = JSON.parse(storedData);
      // Use cached word if less than 24 hours old
      if (now - timestamp < 86400000) {
        setWordOfDay(data);
        setLoading(false);
        return;
      }
    }

    // 3. Fetch fresh word if cache is expired or missing
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Server returned non-JSON response");
      setLoading(false);
      return;
    }

    const result = await response.json();

    if (result.success && result.data) {
      const raw = result.data;
      const translations = raw.translations || [];

      // Check your DB IDs: If English is 1 and Tagalog is 2, this is correct.
      // If Cebuano is 1, English is 2, and Tagalog is 3, increment these IDs.
      const englishEntry = translations.find(t => t.target_entry.language_id === 1)?.target_entry;
      const tagalogEntry = translations.find(t => t.target_entry.language_id === 2)?.target_entry;

      const formattedWord = {
        term: raw.word_term,
        definition: englishEntry?.definition || 'No definition available',
        usageCeb: raw.example_usage,
        usageEng: englishEntry?.example_usage,
        usageTag: tagalogEntry?.example_usage
      };

      // 4. Save to the USER-SPECIFIC key
      await AsyncStorage.setItem(storageKey, JSON.stringify({
        data: formattedWord,
        timestamp: now
      }));
      
      setWordOfDay(formattedWord);
    }
  } catch (error) {
    console.error("Daily word error:", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={{ flex: 1, backgroundColor: '#FFD54F' }}>
      <StatusBar style="dark" backgroundColor="#FFD54F" translucent={false} />

      <TopBar 
        onLogout={() => console.log("Logout")}
        onProfile={() => console.log("Profile")}
      />
      
      <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: '#FFFFFF' }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        >
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.helloText}>Maayong Buntag,</Text>
              <Text style={styles.userName}>Maria Clara</Text>
            </View>
          </View>

          {/* WORD OF THE DAY SECTION */}
          <View style={styles.wordCard}>
            <Text style={styles.wordLabel}>Word of the day</Text>
            {loading ? (
              <ActivityIndicator color="#FFD54F" />
            ) : (
              <>
                <Text style={styles.wordText}>“{wordOfDay?.term || 'Searching...'}”</Text>
                <View style={styles.wordDetails}>
                  <Text style={[styles.meaningText, { fontWeight: 'bold' }]}>
                    Definition (EN): {wordOfDay?.definition}
                  </Text>
                  
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ fontSize: 12, color: '#421C00', opacity: 0.6, marginBottom: 4 }}>Example Usages:</Text>
                    {wordOfDay?.usageCeb && <Text style={styles.usageText}>• Ceb: "{wordOfDay.usageCeb}"</Text>}
                    {wordOfDay?.usageEng && <Text style={styles.usageText}>• Eng: "{wordOfDay.usageEng}"</Text>}
                    {wordOfDay?.usageTag && <Text style={styles.usageText}>• Tag: "{wordOfDay.usageTag}"</Text>}
                  </View>
                </View>
              </>
            )}
          </View>

          {/* PROGRESS / STREAK SECTION */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.titleAccentOrange} />
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>Active</Text>
            </View>
          </View>

          <View style={styles.largeStreakCard}>
            <View style={styles.streakTopRow}>
              <View style={styles.streakTextGroup}>
                <Text style={styles.streakNumberLarge}>24</Text>
                <Text style={styles.streakStatus}>DAY STREAK</Text>
                <View style={styles.onFireBadge}>
                  <Text style={styles.onFireText}>🔥 SUPER STREAK!</Text>
                </View>
              </View>
              <View style={styles.tripleFlameWrapper}>
                <Image source={require('../../assets/images/flame.png')} style={[styles.sideFlame, styles.leftFlame]} resizeMode="contain" />
                <Image source={require('../../assets/images/flame.png')} style={styles.centerFlame} resizeMode="contain" />
                <Image source={require('../../assets/images/flame.png')} style={[styles.sideFlame, styles.rightFlame]} resizeMode="contain" />
              </View>
            </View>

            <View style={styles.largeWeekRow}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
                <View key={index} style={styles.largeDayBox}>
                  <View style={[styles.dayCircleLarge, index < 4 ? styles.dayActive : styles.dayInactive]}>
                    {index < 4 ? <Text style={styles.checkMarkLarge}>✓</Text> : <Text style={styles.lockIcon}>🔒</Text>}
                  </View>
                  <Text style={styles.largeDayText}>{day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ADVENTURE / PROMO SECTION */}
          <View style={styles.promoCardWrapper}>
            <Image source={require('../../assets/logo/bee.png')} style={[styles.flyingBee, styles.bee1]} resizeMode="contain" />
            <Image source={require('../../assets/logo/bee.png')} style={[styles.flyingBee, styles.bee2]} resizeMode="contain" />
            <Image source={require('../../assets/logo/bee.png')} style={[styles.flyingBee, styles.bee3]} resizeMode="contain" />
            
            <View style={styles.promoCard}>
              <View style={styles.promoTextContainer}>
                <Text style={styles.promoLabel}>Learn more about</Text>
                <Text style={styles.promoBrand}>dialectGo</Text>
                <TouchableOpacity style={styles.exploreBtn} activeOpacity={0.8}>
                  <Text style={styles.exploreBtnText}>Explore Now</Text>
                </TouchableOpacity>
              </View>
              <Image source={require('../../assets/logo/jeepLogo.png')} style={styles.jeepneyImageFixed} resizeMode="contain" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNav activeTab={activeTab} setActiveTab={onNavigate} />
    </View>
  );
}