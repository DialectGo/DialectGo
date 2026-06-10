import React, { useEffect, useState, useCallback } from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../shared/lib/supabase';
import { endpoints } from '../../shared/config/apiConfig';
import BottomNav from '../../shared/components/BottomNav';
import TopBar from '../../shared/components/TopBar';
import RefreshContainer from '../../shared/components/RefreshContainer'; // ✅ IMPORT NEW REUSABLE CONTAINER
import { styles } from '../../shared/styles/HomeStyles';
import { useRouter } from 'expo-router';

const availableAvatars = [
  { id: 1, name: 'maria_clara.png', source: require('../../assets/avatars/maria_clara.png') },
  { id: 2, name: '1.png', source: require('../../assets/avatars/1.png') },
  { id: 3, name: '2.png', source: require('../../assets/avatars/2.png') },
  { id: 4, name: '3.png', source: require('../../assets/avatars/3.png') },
  { id: 5, name: '4.png', source: require('../../assets/avatars/4.png') },
];

const WORD_API = endpoints.WORD_OF_DAY;
const PROFILE_API = endpoints.USER_PROFILE;
const STREAK_API = endpoints.USER_STREAK;

export default function Home({ onNavigate, activeTab }) {
  const router = useRouter();
  const [wordOfDay, setWordOfDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ✅ NEW REFRESHING CONTROL STATE
  const [userName, setUserName] = useState('User'); 
  const [userAvatar, setUserAvatar] = useState(availableAvatars[0].source);
  
  const [streakData, setStreakData] = useState({ streak: 0, activeDays: [] });

  const getValidSession = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData?.session?.access_token) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshData?.session?.access_token) {
        throw new Error('Authentication expired. Please log in again.');
      }
      return refreshData.session;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(sessionData.session.access_token);
    if (userError || !userData?.user) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshData?.session?.access_token) {
        throw new Error('Authentication expired. Please log in again.');
      }
      return refreshData.session;
    }

    return sessionData.session;
  };

  const getCebuanoGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return 'Maayong Buntag,';
    if (currentHour >= 12 && currentHour < 18) return 'Maayong Hapon,';
    return 'Maayong Gabii,';
  };

  // Base loader module
  const loadAllData = async (forceRefresh = false) => {
    await Promise.all([
      fetchUserProfile(),
      fetchDailyWord(forceRefresh), // Pass down force refresh boolean tag
      fetchStreak()
    ]);
  };

  // On First Mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await loadAllData(false);
      setLoading(false);
    };
    initializeData();
  }, []);

  // ✅ NEW: Pull-To-Refresh Event Handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData(true); // force underlying fetch operations to clear cache locks
    setRefreshing(false);
  }, []);

  const parseJsonResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${body}`);
    }
    if (contentType.includes('application/json')) {
      return response.json();
    }
    const body = await response.text();
    throw new Error(`Expected JSON response but got ${contentType}: ${body}`);
  };

  const fetchStreak = async () => {
    try {
      const session = await getValidSession();

      const response = await fetch(STREAK_API, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await parseJsonResponse(response);
      if (result.success) setStreakData(result.data);
    } catch (error) {
      console.error("Home Fetch Streak Error:", error);
    }
  };

  const getWeeklyStatus = () => {
    const status = [false, false, false, false, false, false, false];
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    sunday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(sunday);
      tempDate.setDate(sunday.getDate() + i);
      const dateString = tempDate.toISOString().split('T')[0];
      if (streakData.activeDays && streakData.activeDays.includes(dateString)) {
        status[i] = true;
      }
    }
    return status;
  };

  const weeklyStatus = getWeeklyStatus();

  const fetchUserProfile = async () => {
    try {
      const session = await getValidSession();

      const response = await fetch(PROFILE_API, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await parseJsonResponse(response);
      if (result.success) {
        const user = result.data;
        setUserName(user.first_name || 'User');
        if (user.profile_avatar_url) {
          const matched = availableAvatars.find(a => a.name === user.profile_avatar_url);
          if (matched) setUserAvatar(matched.source);
        }
      }
    } catch (error) {
      console.error("Home Profile Fetch Error:", error);
    }
  };

  const fetchDailyWord = async (forceRefresh = false) => {
    try {
      const session = await getValidSession();

      const userId = session.user.id;
      const storageKey = `word_of_the_day_${userId}`;
      const now = Date.now();

      // Skip cache verification check if the user physically triggers a pull refresh action
      if (!forceRefresh) {
        const storedData = await AsyncStorage.getItem(storageKey);
        if (storedData) {
          const { data, timestamp } = JSON.parse(storedData);
          if (now - timestamp < 86400000) {
            setWordOfDay(data);
            return;
          }
        }
      }

      const response = await fetch(WORD_API, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await parseJsonResponse(response);
      if (result.success && result.data) {
        const raw = result.data;
        const translations = raw.translations || [];
        const englishEntry = translations.find(t => t.target_entry.language_id === 1)?.target_entry;
        const tagalogEntry = translations.find(t => t.target_entry.language_id === 2)?.target_entry;

        const formattedWord = {
          term: raw.word_term,
          definition: englishEntry?.definition || 'No definition available',
          usageCeb: raw.example_usage,
          usageEng: englishEntry?.example_usage,
          usageTag: tagalogEntry?.example_usage
        };

        await AsyncStorage.setItem(storageKey, JSON.stringify({
          data: formattedWord,
          timestamp: now
        }));
        setWordOfDay(formattedWord);
      }
    } catch (error) {
      console.error("Daily word error:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFD54F' }}>
      <StatusBar style="dark" backgroundColor="#FFD54F" translucent={false} />
      <TopBar onLogout={() => { }} onProfile={() => { }} />

      <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: '#FFFFFF' }]}>
        {/* ✅ SWAPPED ScrollView FOR OUR DYNAMIC REFRESH CONTAINER */}
        <RefreshContainer
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        >
          
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.helloText}>{getCebuanoGreeting()}</Text>
              <Text style={styles.userName}>{userName}</Text>
              <View style={styles.statusBadge}><Text style={styles.statusText}>• Online</Text></View>
            </View>
            <View style={styles.avatarWrapper}>
              <Image source={userAvatar} style={styles.avatarMain} />
            </View>
          </View>

          {/* WORD OF THE DAY */}
          <View style={styles.wordCard}>
            <Text style={styles.wordLabel}>Word of the day</Text>
            {loading ? <ActivityIndicator color="#FFD54F" /> : (
              <>
                <Text style={styles.wordText}>“{wordOfDay?.term || 'Searching...'}”</Text>
                <View style={styles.wordDetails}>
                  <Text style={[styles.meaningText, { fontWeight: 'bold' }]}>Definition (EN): {wordOfDay?.definition}</Text>
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

          {/* DYNAMIC PROGRESS SECTION */}
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
                <Text style={styles.streakNumberLarge}>{streakData.streak}</Text>
                <Text style={styles.streakStatus}>DAY STREAK</Text>
                {streakData.streak >= 7 && (
                  <View style={styles.onFireBadge}>
                    <Text style={styles.onFireText}>🔥 SUPER STREAK!</Text>
                  </View>
                )}
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
                  <View style={[styles.dayCircleLarge, weeklyStatus[index] ? styles.dayActive : styles.dayInactive]}>
                    {weeklyStatus[index] ? <Text style={styles.checkMarkLarge}>✓</Text> : <Text style={styles.lockIcon}>🔒</Text>}
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
                <TouchableOpacity 
                  style={styles.exploreBtn} 
                  activeOpacity={0.8}
                  onPress={() => router.push('/Chatbot/ChatOnboarding')}
                >
                  <Text style={styles.exploreBtnText}>Explore Now</Text>
                </TouchableOpacity>

              </View>
              <Image source={require('../../assets/logo/jeepLogo.png')} style={styles.jeepneyImageFixed} resizeMode="contain" />
            </View>
          </View>
          
        </RefreshContainer>
      </SafeAreaView>
      <BottomNav activeTab={activeTab} setActiveTab={onNavigate} />
    </View>
  );
}