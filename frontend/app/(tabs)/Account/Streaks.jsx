import React, { useEffect, useState } from 'react';
import {
  Image, ScrollView, StatusBar, Text, TouchableOpacity, View, SafeAreaView, ActivityIndicator
} from 'react-native';
import { styles } from '../../../shared/styles/StreakStyles';
import { useRouter } from 'expo-router';
import { supabase } from '../../../shared/lib/supabase';
import ProfileTopBar from '../../../shared/components/ProfileTopBar';

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
      const response = await fetch('http://192.168.1.15:5001/api/v1/users/streak', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      if (result.success) setStreakData(result.data);
    } catch (error) {
      console.error("Fetch Streak Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentStreak = streakData.streak;
  const currentWeekNum = Math.floor(currentStreak / 7) + 1;
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  /**
   * Logic: 
   * 1. Get the current date.
   * 2. Find the most recent Sunday (start of the week).
   * 3. Loop 7 times to create the YYYY-MM-DD string for each day of this week.
   * 4. Check if that string exists in the activeDays array from the backend.
   */
  const getWeeklyStatus = () => {
    const status = [false, false, false, false, false, false, false];
    const today = new Date();
    
    // Find Sunday of the current week
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    sunday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(sunday);
      tempDate.setDate(sunday.getDate() + i);
      
      // Format as YYYY-MM-DD to match database/backend format
      const dateString = tempDate.toISOString().split('T')[0];
      
      if (streakData.activeDays && streakData.activeDays.includes(dateString)) {
        status[i] = true;
      }
    }
    return status;
  };

  const weeklyStatus = getWeeklyStatus();

  if (loading) return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#FBBF24" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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