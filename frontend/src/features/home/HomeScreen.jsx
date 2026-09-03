import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  Animated, Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useRouter, Stack } from 'expo-router';

// Hooks
import { useHomeData } from '../../shared/hooks/useHomeData';
import { useMascotAnimation } from './hooks/useMascotAnimation';
import { getCebuanoGreeting } from '../../shared/utils/dateUtils';

// Components
import BottomNav from '../../components/BottomNav';
import TopBar from '../../components/TopBar';
import RefreshContainer from '../../shared/components/RefreshContainer';
import HomeSkeleton from '../../shared/components/HomeSkeleton';
import HomeCard from '../../shared/components/HomeCard';
import HomeCarousel from '../../shared/components/HomeCarousel';
import WordOfDayOverlay from '../../shared/components/WordOfDayOverlay';
import { getStreakAsset } from '../../shared/utils/streakAssets';
import { styles } from './styles/HomeStyles';

export default function HomeScreen({ onNavigate, activeTab }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [wotdModalVisible, setWotdModalVisible] = useState(false);

  
  // Custom Hooks Encapsulating Business Logic
  const mascotAnim = useMascotAnimation(-8, 1200);
  const {
    loading,
    refreshing,
    wordOfDay,
    userName,
    streakData,
    weeklyStatus,
    handleRefresh
  } = useHomeData();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Stack.Screen options={{ animation: "fade" }} />
      <TopBar titleMode="brand" />

      <View style={[styles.container, { flex: 1, backgroundColor: '#FFFFFF' }]}>
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
                source={require('../../../assets/logo/bee.png')}
                style={[
                  styles.heroBee,
                  { transform: [{ translateY: mascotAnim }] }
                ]}
                resizeMode="contain"
              />
            </View>

            {/* RIGHT — DATE, GREETING, WORD CARD */}
            <View style={styles.heroContent}>
              <Text style={styles.heroDate}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                }).toUpperCase()}
              </Text>

              <Text style={styles.heroGreeting}>
                {getCebuanoGreeting()}{' '}
                <Text style={styles.heroUserName}>
                  {userName}!
                </Text>
              </Text>

              <TouchableOpacity
                style={styles.wordOfDayBubble}
                activeOpacity={0.9}
                onPress={() => setWotdModalVisible(true)}
              >
                <View style={styles.wordBubbleArrow} />

                {loading ? (
                  <View style={{ gap: 8, alignItems: 'center', marginVertical: 10 }}>
                    <HomeSkeleton width={140} height={24} borderRadius={12} />
                    <HomeSkeleton width={100} height={16} borderRadius={8} />
                    <HomeSkeleton width={200} height={12} borderRadius={6} />
                  </View>
                ) : (
                  <>
                    <Text style={styles.heroWord}>
                      “{wordOfDay?.term || 'Searching...'}”
                    </Text>
                    {wordOfDay?.translation && (
                      <Text style={styles.heroTranslation}>
                        {wordOfDay.translation}
                      </Text>
                    )}
                    <Text style={styles.heroDefinition} numberOfLines={2}>
                      {wordOfDay?.definition || 'Loading definition...'}
                    </Text>
                    <Text style={styles.heroDetails}>
                      View More Details.
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* STREAK CARD WRAPPED IN BASECARD */}
          <HomeCard
            title="Your Progress"
            subtitle="Keep the streak alive! 🐝"
            rightBadge={
              <View style={styles.streakBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.streakBadgeText}>ACTIVE</Text>
              </View>
            }
          >
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

              <View style={styles.tripleFlameWrapper}>
                <Image
                  source={getStreakAsset(streakData.streak)}
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
                      <View key={index} style={styles.largeDayBox}>
                        <View
                          style={[
                            styles.dayCircleLarge,
                            completed ? styles.dayActive : styles.dayInactive
                          ]}
                        >
                          {completed ? (
                            <Text style={styles.checkMarkLarge}>✓</Text>
                          ) : (
                            <Text style={styles.lockIcon}>🔒</Text>
                          )}
                        </View>
                        <Text style={styles.largeDayText}>{day}</Text>
                      </View>
                    );
                  }
                )}
              </View>
            </View>
          </HomeCard>

          {/* CAROUSEL PROMO SECTION */}
          <HomeCarousel />

        </RefreshContainer>
      </View>
      <BottomNav activeTab={activeTab} setActiveTab={onNavigate} />

      {/* WORD OF THE DAY MODAL */}
      <WordOfDayOverlay 
        visible={wotdModalVisible} 
        onClose={() => setWotdModalVisible(false)} 
        wordData={wordOfDay} 
      />
    </View>
  );
}