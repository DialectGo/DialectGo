import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView
} from 'react-native';
import { styles } from '../../../shared/styles/StreakStyles';
import { useRouter } from 'expo-router';

export default function Streaks({ streak = 24 }) { 
  const router = useRouter(); 
  
  const currentStreak = streak;
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  // Halimbawa: Active mula Sunday hanggang Wednesday (based sa 24 days streak)
  const activeDays = [true, true, true, true, false, false, false]; 

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />

      {/* YELLOW HEADER - Consistent with Profile */}
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Image 
            source={require('../../../assets/icons/backArrow.png')} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Streaks</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollBody}
      >
        {/* MAIN STREAK DISPLAY */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={require('../../../assets/images/flame.png')} 
              style={styles.bigFireIcon} 
            />
          </View>
          <Text style={styles.userName}>{currentStreak}</Text>
          <Text style={styles.streakSubtext}>Day Streak!</Text>
        </View>

        {/* YELLOW CONTAINER - Bubbly Style */}
        <View style={styles.settingsContainer}>
          
          {/* WEEKLY TRACKER */}
          <View style={styles.whiteCard}>
            <Text style={styles.cardLabel}>THIS WEEK</Text>
            <View style={styles.weekGrid}>
              {daysOfWeek.map((day, index) => (
                <View key={index} style={styles.dayColumn}>
                  <View style={[
                    styles.dayCircle, 
                    activeDays[index] ? styles.activeDayCircle : styles.inactiveDayCircle
                  ]}>
                    {activeDays[index] && (
                      <Image 
                        source={require('../../../assets/icons/check_icon.png')} 
                        style={styles.checkIcon} 
                      />
                    )}
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* PROGRESS MILESTONE */}
          <View style={styles.whiteCard}>
            <Text style={styles.cardLabel}>NEXT MILESTONE: 30 DAYS</Text>
            <Text style={styles.milestoneDesc}>
              {30 - currentStreak > 0 
                ? `${30 - currentStreak} days left to unlock the Badge!` 
                : "Milestone Reached! 🎉"}
            </Text>
            <View style={styles.progressBarBg}>
              <View style={[
                styles.progressBarFill, 
                { width: `${Math.min((currentStreak / 30) * 100, 100)}%` }
              ]} />
            </View>
          </View>

          {/* QUICK STATS */}
          <View style={styles.statsRow}>
             <View style={styles.statItem}>
                <Text style={styles.statNumber}>156</Text>
                <Text style={styles.statSub}>Words</Text>
             </View>
             <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statSub}>Lessons</Text>
             </View>
          </View>

          <View style={{ height: 50 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}