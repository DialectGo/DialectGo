import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  Image, ScrollView, StatusBar, Text, TouchableOpacity, View,  ActivityIndicator
} from 'react-native';
import { styles } from './styles/StreakStyles';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../components/ProfileTopBar';
import { getWeeklyStatus } from '../../shared/utils/dateUtils';
import { useProfileContext } from '../../shared/context/ProfileContext';
import HomeCard from '../../shared/components/HomeCard';

export default function StreaksScreen() { 
  const router = useRouter(); 
  const { loading, streakCount, activeDays } = useProfileContext();

  const currentStreak = streakCount || 0;
  const currentWeekNum = Math.floor(currentStreak / 7) + 1;
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const weeklyStatus = getWeeklyStatus(activeDays || []);

  if (loading) return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#FBBF24" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      <ProfileTopBar title="Streaks" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
        <View style={styles.contentWrapper}>
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
                    {currentStreak}
                  </Text>
                  <Text style={styles.streakDays}>
                    DAYS
                  </Text>
                </View>
                {currentStreak >= 7 && (
                  <View style={styles.superStreakBadge}>
                    <Text style={styles.superStreakText}>
                      🔥 SUPER STREAK!
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.tripleFlameWrapper}>
                <Image
                  source={require('../../../assets/icons/profile/streak_icon.png')}
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
                {daysOfWeek.map(
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

          {/* PROGRESS TO NEXT 7-DAY MILESTONE */}
          <View style={styles.whiteCardWrapper}>
            <View style={styles.whiteCard}>
              <Text style={styles.cardLabel}>NEXT WEEK: WEEK {currentWeekNum + 1}</Text>
              <Text style={styles.milestoneDesc}>
                {7 - (currentStreak % 7)} days left until your next week milestone!
              </Text>
              <View style={styles.progressBarBg}>
                <View style={[
                  styles.progressBarFill, 
                  { width: `${((currentStreak % 7) / 7) * 100}%` }
                ]} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
