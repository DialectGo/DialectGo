import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity,
} from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../shared/lib/supabase';

import { useRouter } from 'expo-router';

const YELLOW = '#FFCB45';
const BROWN = '#5D4037';
const DARK_BROWN = '#3E2723';
const MUTED_BROWN = '#8D6E63';

function AvatarDisplay({ uri, onEdit }) {
  return (
    <View style={styles.avatarContainer}>
      <View style={styles.avatarWrapper}>
        <Image source={uri} style={styles.avatarImage} />
        {onEdit && (
          <TouchableOpacity style={styles.editBadge} onPress={onEdit}>
            <Ionicons name="pencil" size={14} color="black" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function Home() {
    const router = useRouter();
    const [view, setView] = useState('view');
    const [loading, setLoading] = useState(true); // New: Loading state

    const [userData, setUserData] = useState({
      firstName: '',
      lastName: '',
      age: '',
      email: '',
      avatar: require('../../assets/avatars/1.png'), // Default
      avatarId: 1 // Helper to track which index we are using
    });

    const avatars = [
      require('../../assets/avatars/1.png'),
      require('../../assets/avatars/2.png'),
      require('../../assets/avatars/3.png'),
      require('../../assets/avatars/5.png'),
    ];

    const fetchProfileData = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
    
          const response = await fetch('http://192.168.1.50:5001/api/users/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
    
          const result = await response.json();
    
          if (response.ok) {
            setUserData({
              firstName: result.firstName || '',
              lastName: result.lastName || '',
              age: result.age || '',
              email: result.email || '',
              // Use result.avatar (e.g., "2") to pick from local array
              avatar: avatars[parseInt(result.avatar) - 1] || avatars[0],
              avatarId: parseInt(result.avatar) || 1
            });
          }
        } catch (error) {
          console.error("Profile Fetch Error:", error);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchProfileData();
      }, []);
  // need pa ito from the database 
  const wordOfTheDay = {
    word: '"Puhon"',
    meaning: 'Meaning: Soon / Hopefully / God willing',
    usage: '"Magkita ta puhon"',
    usageTranslation: '(We will see each other soon/hopefully)',
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out of DialectoGo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) Alert.alert('Error', error.message);
          },
        },
      ],
    );
  };

  const handleSeeStreak = () => {
    // palitan ng navigation logic papunta sa streak details screen
  };

  const handleExplore = () => {
    // palitan ng navigation logic papunta sa explore screen (ai)
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {/* dito lagay avatar — placeholder muna */}
            <AvatarDisplay uri={userData.avatar} />
            <View style={styles.headerTextBlock}>
              <Text style={styles.helloText}>Hello,</Text>
              <Text style={styles.nameText}>{userData.firstName}</Text>
              <Text style={styles.subtitleText}>Enjoy Translating and Learning!</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <Avatar.Icon
              size={40}
              icon="logout"
              backgroundColor="#F5F0EB"
              color={MUTED_BROWN}
            />
          </TouchableOpacity>
        </View>

        {/* ── Discover Label ── */}
        <Text style={styles.discoverTitle}>Discover</Text>

        {/* ── Word of the Day ── */}
        <View style={styles.wordCard}>
          <View style={styles.wordCardBadge}>
            <Text style={styles.wordCardBadgeText}>Word of the day</Text>
          </View>
          <Text style={styles.mainWord}>{wordOfTheDay.word}</Text>
          <View style={styles.wordDivider} />
          <Text style={styles.wordMeaning}>{wordOfTheDay.meaning}</Text>
          <Text style={styles.wordUsage}>Usage: {wordOfTheDay.usage}</Text>
          <Text style={styles.wordUsage}>{wordOfTheDay.usageTranslation}</Text>
        </View>

        {/* ── Streak Row ── */}
        <View style={styles.streakRow}>

          {/* Left — count */}
          <View style={styles.streakLeft}>
            <Text style={styles.streakYouText}>You are in</Text>
            <View style={styles.numberCircle}>
              <Text style={styles.streakNumberText}>24</Text>
            </View>
            <Text style={styles.streakDaysText}>days streak</Text>
          </View>

          {/* Right — flame */}
          <View style={styles.streakRight}>
            <Text style={styles.streakHint}>{'Keep using the app\nfor the flame.'}</Text>
            <Image
              source={require('../../assets/images/flame.png')}
              style={styles.flameImage}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.streakBtn} onPress={handleSeeStreak} activeOpacity={0.8}>
              <Text style={styles.streakBtnText}>See Streak</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* ── Explore Banner ── */}
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerLabel}>Learn more about</Text>
            <Text style={styles.bannerTitle}>dialectGo</Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={handleExplore} activeOpacity={0.8}>
              <Text style={styles.exploreBtnText}>Explore</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require('../../assets/images/jeepney.png')}
            style={styles.jeepneyImage}
            resizeMode="contain"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 14,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTextBlock: {
    flexShrink: 1,
  },
  helloText: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED_BROWN,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: BROWN,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 11,
    color: MUTED_BROWN,
    fontWeight: '500',
    marginTop: 1,
  },

  discoverTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1917',
    letterSpacing: -0.4,
    marginBottom: 2,
  },

  wordCard: {
    backgroundColor: YELLOW,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#C8960A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  wordCardBadge: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 14,
  },
  wordCardBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: BROWN,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  mainWord: {
    fontSize: 42,
    fontWeight: '900',
    color: DARK_BROWN,
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: 14,
  },
  wordDivider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(93,64,55,0.15)',
    marginBottom: 12,
  },
  wordMeaning: {
    fontSize: 12,
    fontStyle: 'italic',
    color: BROWN,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  wordUsage: {
    fontSize: 11,
    fontStyle: 'italic',
    color: MUTED_BROWN,
    textAlign: 'center',
    lineHeight: 18,
  },

  streakRow: {
    flexDirection: 'row',
    gap: 12,
  },
  streakLeft: {
    width: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  streakYouText: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED_BROWN,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  numberCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: YELLOW,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    shadowColor: '#C8960A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  streakNumberText: {
    fontSize: 40,
    fontWeight: '900',
    color: BROWN,
    letterSpacing: -1,
  },
  streakDaysText: {
    fontSize: 13,
    fontWeight: '700',
    color: MUTED_BROWN,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  streakRight: {
    flex: 1,
    backgroundColor: YELLOW,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#C8960A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  streakHint: {
    fontSize: 10,
    fontWeight: '600',
    color: BROWN,
    textAlign: 'center',
    lineHeight: 15,
  },
  flameImage: {
    width: 52,
    height: 52,
  },
  streakBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  streakBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: BROWN,
  },

  banner: {
    backgroundColor: YELLOW,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#C8960A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  bannerLeft: {
    flex: 1,
    gap: 4,
  },
  bannerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: BROWN,
    letterSpacing: 0.2,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: DARK_BROWN,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  exploreBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 22,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  exploreBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: BROWN,
  },
  jeepneyImage: {
    width: 100,
    height: 100,
    marginLeft: 8,
  },
    avatarContainer: { marginTop: 30, marginBottom: 15 },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 75,
    backgroundColor: '#FDE68A',
    padding: 5,
    borderWidth: 2,
    borderColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 75 },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000'
  },
});
