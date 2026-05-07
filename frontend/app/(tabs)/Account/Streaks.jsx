import React, { useEffect, useState } from 'react';
import {
  Image, ScrollView, StatusBar, Text, TouchableOpacity, View, SafeAreaView, ActivityIndicator
} from 'react-native';
import { styles } from '../../../shared/styles/StreakStyles';
import { useRouter } from 'expo-router';
import { supabase } from '../../../shared/lib/supabase';

export default function Streaks() { 
  const router = useRouter(); 
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({ streak: 0, activeDays: [] });

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('http://192.168.0.104:5001/api/v1/user/streak', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      if (result.success) setStreakData(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const currentStreak = streakData.streak;
  // Logic: Every 7 days = 1 week
  const currentWeekNum = Math.floor(currentStreak / 7) + 1;
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Check if current day of week was an "active day" (3+ translations)
  const getWeeklyStatus = () => {
    const status = [false, false, false, false, false, false, false];
    // logic to map streakData.activeDays to S-M-T-W-T-F-S for the current week
    return status;
  };

  if (loading) return <ActivityIndicator style={{flex:1}} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image source={require('../../../assets/icons/backArrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Streaks</Text>
      </View>

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
                    getWeeklyStatus()[index] ? styles.activeDayCircle : styles.inactiveDayCircle
                  ]}>
                    {getWeeklyStatus()[index] && (
                      <Image source={require('../../../assets/icons/check_icon.png')} style={styles.checkIcon} />
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
    </SafeAreaView>
  );
}