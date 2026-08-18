import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Animated, Easing, Image,

  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../src/shared/api/supabase';
import { endpoints } from '../../src/shared/api/client';
import BottomNav from '../../src/components/BottomNav';
import TopBar from '../../src/components/TopBar';
import RefreshContainer from '../../src/shared/components/RefreshContainer'; // ✅ IMPORT NEW REUSABLE CONTAINER
import { styles } from '../../src/features/home/styles/HomeStyles';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';

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
  const { slide } = useLocalSearchParams();

  const router = useRouter();
  const [wordOfDay, setWordOfDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ✅ NEW REFRESHING CONTROL STATE
  const [userName, setUserName] = useState('User');
  const [userAvatar, setUserAvatar] = useState(availableAvatars[0].source);
  const [wotdModalVisible, setWotdModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const [streakData, setStreakData] = useState({ streak: 0, activeDays: [] });

  const mascotAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotAnim, { toValue: -8, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(mascotAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);


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
          if (matched) {
            setUserAvatar(matched.source);
          } else if (user.profile_avatar_url.startsWith('http')) {
            setUserAvatar({ uri: user.profile_avatar_url });
          }
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
          translation: englishEntry?.word_term || null,
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
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Stack.Screen options={{ animation: "fade" }} />
      <TopBar titleMode="brand" />

      <View style={[styles.container, { flex: 1, backgroundColor: '#FFFFFF' }]}>
        {/* ✅ SWAPPED ScrollView FOR OUR DYNAMIC REFRESH CONTAINER */}
        <RefreshContainer
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120, paddingTop: insets.top + 55 }]}
        >

          {/* HOME HERO / WORD OF THE DAY */}
          <View style={styles.homeHero}>

            {/* LEFT — BEE */}
            <View style={styles.heroBeeContainer}>
              <Animated.Image
                source={require('../../assets/logo/bee.png')}
                style={[
                  styles.heroBee,
                  { transform: [{ translateY: mascotAnim }] }
                ]}
                resizeMode="contain"
              />
            </View>

            {/* RIGHT — DATE, GREETING, WORD CARD */}
            <View style={styles.heroContent}>

              {/* DATE */}
              <Text style={styles.heroDate}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                }).toUpperCase()}
              </Text>

              {/* GREETING */}
              <Text style={styles.heroGreeting}>
                {getCebuanoGreeting()},{' '}
                <Text style={styles.heroUserName}>
                  {userName}!
                </Text>
              </Text>

              {/* WORD OF THE DAY CARD */}
              <TouchableOpacity
                style={styles.wordOfDayBubble}
                activeOpacity={0.9}
                onPress={() => setWotdModalVisible(true)}
              >

                {/* SPEECH ARROW */}
                <View style={styles.wordBubbleArrow} />

                {loading ? (
                  <ActivityIndicator color="#B45309" />
                ) : (
                  <>
                    {/* WORD */}
                    <Text style={styles.heroWord}>
                      “{wordOfDay?.term || 'Searching...'}”
                    </Text>

                    {/* TRANSLATION */}
                    {wordOfDay?.translation && (
                      <Text style={styles.heroTranslation}>
                        {wordOfDay.translation}
                      </Text>
                    )}

                    {/* DEFINITION */}
                    <Text
                      style={styles.heroDefinition}
                      numberOfLines={2}
                    >
                      {wordOfDay?.definition || 'Loading definition...'}
                    </Text>

                    {/* DETAILS */}
                    <Text style={styles.heroDetails}>
                      View More Details.
                    </Text>
                  </>
                )}

              </TouchableOpacity>

            </View>
          </View>

          {/* DYNAMIC PROGRESS SECTION */}
          <View style={styles.progressSectionHeader}>
            <View>
              <Text style={styles.progressSectionTitle}>Your Progress</Text>
              <Text style={styles.progressSubtitle}>
                Keep the streak alive! 🐝
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.streakBadgeText}>ACTIVE</Text>
            </View>
          </View>

          {/* STREAK CARD */}
          <View style={styles.progressCard}>
            {/* TOP */}
            <View style={styles.progressTopRow}>
              <View style={styles.streakTextGroup}>
                <Text style={styles.streakSmallLabel}>
                  CURRENT STREAK
                </Text>
                <View style={styles.streakNumberRow}>
                  <Text style={styles.streakNumberLarge}>
                    {streakData.streak}
                  </Text>
                  <Text style={styles.streakDays}>
                    DAYS
                  </Text>
                </View>
                {streakData.streak >= 7 && (
                  <View style={styles.superStreakBadge}>
                    <Text style={styles.superStreakText}>
                      🔥 SUPER STREAK!
                    </Text>
                  </View>
                )}
              </View>

              {/* FLAMES */}
              <View style={styles.tripleFlameWrapper}>
                <Image
                  source={require('../../assets/images/beefire.png')}
                  style={styles.centerFlame}
                  resizeMode="contain"
                />
              </View>
            </View>
            {/* WEEKLY PROGRESS */}
            <View style={styles.weeklyProgressContainer}>
              <Text style={styles.weeklyProgressTitle}>
                THIS WEEK
              </Text>
              <View style={styles.largeWeekRow}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(
                  (day, index) => {

                    const completed = weeklyStatus[index];

                    return (
                      <View
                        key={index}
                        style={styles.largeDayBox}
                      >

                        <View
                          style={[
                            styles.dayCircleLarge,
                            completed
                              ? styles.dayActive
                              : styles.dayInactive
                          ]}
                        >
                          {completed ? (
                            <Text style={styles.checkMarkLarge}>
                              ✓
                            </Text>
                          ) : (
                            <Text style={styles.lockIcon}>
                              🔒
                            </Text>
                          )}
                        </View>

                        <Text style={styles.largeDayText}>
                          {day}
                        </Text>

                      </View>
                    );
                  }
                )}
              </View>
            </View>
          </View>

          {/* ADVENTURE / PROMO SECTION */}
          {/* CHATBOT PROMO SECTION */}
          <View style={styles.chatPromoWrapper}>

            <View style={[styles.chatBubbleSmall, styles.chatBubbleOne]}>
              <Text style={styles.chatBubbleEmoji}>💬</Text>
            </View>

            <View style={[styles.chatBubbleSmall, styles.chatBubbleTwo]}>
              <Text style={styles.chatBubbleEmoji}>✨</Text>
            </View>

            <View style={styles.chatPromoCard}>

              {/* BEE */}
              <View style={styles.chatBeeContainer}>
                <Image
                  source={require('../../assets/logo/bee.png')}
                  style={styles.chatPromoBee}
                  resizeMode="contain"
                />

                <View style={styles.beeChatBubble}>
                  <Text style={styles.beeChatText}>
                    Kumusta! 👋
                  </Text>
                </View>
              </View>

              {/* CHATBOT CONTENT */}
              <View style={styles.chatPromoContent}>

                <Text style={styles.chatPromoLabel}>
                  NEED A LITTLE HELP?
                </Text>

                <Text style={styles.chatPromoTitle}>
                  Talk with
                  <Text style={styles.chatPromoTitleAccent}>
                    {' '}DialectGo
                  </Text>
                </Text>

                <Text style={styles.chatPromoDescription}>
                  Ask questions, practice languages,
                  and learn something new with your
                  AI language buddy!
                </Text>

                <TouchableOpacity
                  style={styles.chatExploreBtn}
                  activeOpacity={0.85}
                  onPress={() => router.push('/Chatbot/ChatOnboarding')}
                >
                  <Text style={styles.chatExploreBtnText}>
                    Chat Now
                  </Text>

                  <Text style={styles.chatExploreArrow}>
                    →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </RefreshContainer>
      </View>
      <BottomNav activeTab={activeTab} setActiveTab={onNavigate} />
      {/* WORD OF THE DAY MODAL */}
      <Modal visible={wotdModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.wotdModalCard}>
            <Text style={styles.wotdModalTitle}>“{wordOfDay?.term}”</Text>
            <View style={styles.wotdDivider} />
            <Text style={styles.wotdModalSubtitle}>Definition</Text>
            <Text style={styles.wotdModalText}>{wordOfDay?.definition}</Text>

            <Text style={[styles.wotdModalSubtitle, { marginTop: 15 }]}>Usages</Text>
            {wordOfDay?.usageCeb ? <Text style={styles.wotdModalUsage}>• Ceb: "{wordOfDay.usageCeb}"</Text> : null}
            {wordOfDay?.usageEng ? <Text style={styles.wotdModalUsage}>• Eng: "{wordOfDay.usageEng}"</Text> : null}
            {wordOfDay?.usageTag ? <Text style={styles.wotdModalUsage}>• Tag: "{wordOfDay.usageTag}"</Text> : null}

            <TouchableOpacity
              style={styles.wotdModalCloseBtn}
              onPress={() => setWotdModalVisible(false)}
            >
              <Text style={styles.wotdModalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}