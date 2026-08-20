import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  Image, ScrollView, StatusBar, Text, TouchableOpacity, View,  ActivityIndicator
} from 'react-native';
import { styles } from './styles/StreakStyles';
import { useRouter } from 'expo-router';
import ProfileTopBar from '../../components/ProfileTopBar';
import { getWeeklyStatus } from '../../shared/utils/dateUtils';
import { useProfileContext } from '../../shared/contexts/profile/ProfileContext';

export default function StreaksScreen() { 
  const router = useRouter(); 
  const { loading, streakCount, activeDays } = useProfileContext();

  const currentStreak = streakCount || 0;
  const currentWeekNum = Math.floor(currentStreak / 7) + 1;
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image source={require('../../../assets/images/flame.png')} style={styles.bigFireIcon} />
          </View>
          <Text style={styles.userName}>{currentStreak}</Text>
          <Text style={styles.streakSubtext}>Day Streak!</Text>
          <Text style={styles.weekIndicator}>Week {currentWeekNum}</Text>
        </View>

        <View style={styles.settingsContainer}>
          <View style={styles.whiteCard}>
            <Text style={styles.cardLabel}>WEEK {currentWeekNum} PROGRESS</Text>
            <View style={styles.weekGrid}>
              {daysOfWeek.map((day, index) => (
                <View key={index} style={styles.dayColumn}>
                  <View style={[
                    styles.dayCircle, 
                    weeklyStatus[index] ? styles.activeDayCircle : styles.inactiveDayCircle
                  ]}>
                    {weeklyStatus[index] && (
                      <Image source={require('../../../assets/icons/status/check_icon.png')} style={styles.checkIcon} />
                    )}
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* PROGRESS TO NEXT 7-DAY MILESTONE */}
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
      </ScrollView>
    </View>
  );
}
