import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../../../shared/styles/StreakStyles';
import { useRouter } from 'expo-router'; // 1. I-import ang useRouter

export default function Streaks({ streak }) { // Alisin ang onNavigate prop kung gagamit ng router
  const router = useRouter(); // 2. I-initialize ang router
  
  const currentStreak = streak || 0;
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const activeDays = [true, true, true, true, false, false, false]; 

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="transparent" 
        barStyle="dark-content" 
        translucent={true} 
      />

      {/* FIXED HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()} // 3. Gamitin ang router.back() para bumalik sa Profile
        >
          <Image 
            source={require('../../../assets/icons/back_arrow.png')} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Streaks</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* BIG STREAK CARD */}
        <View style={styles.mainCard}>
          <Image 
            source={require('../../../assets/images/flame.png')} 
            style={styles.bigFireIcon} 
          />
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakSubtext}>Day Streak!</Text>
          <Text style={styles.motivationText}>
            You're doing great! Keep learning to maintain your streak and unlock rewards.
          </Text>
        </View>

        {/* WEEKLY PROGRESS */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>This Week</Text>
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

        {/* STATS SECTION */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Total Words</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </View>
        </View>

        {/* MILESTONE CARD */}
        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneTitle}>Next Milestone: 30 Days</Text>
          <Text style={styles.milestoneDesc}>
            {30 - currentStreak > 0 ? `${30 - currentStreak} days left to unlock the Badge!` : "Milestone Reached!"}
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min((currentStreak / 30) * 100, 100)}%` }]} />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}