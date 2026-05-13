import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomNav from '../../shared/components/BottomNav';
import TopBar from '../../shared/components/TopBar';
import { styles } from '../../shared/styles/HomeStyles';

export default function Home({ onNavigate, activeTab }) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <TopBar onMenuPress={() => console.log("Menu Pressed!")} />

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
          <Text style={styles.wordLabel}>Word of the day</Text>
          <Text style={styles.wordText}>"Puhon"</Text>
          <View style={styles.wordDetails}>
            <Text style={styles.meaningText}>Meaning: Soon / Hopefully</Text>
            <Text style={styles.usageText}>"Magkita ta puhon"</Text>
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

          <View style={styles.largeWeekRow}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
              <View key={index} style={styles.largeDayBox}>
                <View style={[styles.dayCircleLarge, index < 4 ? styles.dayActive : styles.dayInactive]}>
                  {index < 4 
                    ? <Text style={styles.checkMarkLarge}>✓</Text> 
                    : <Text style={styles.lockIcon}>🔒</Text>
                  }
                </View>
                <Text style={styles.largeDayText}>{day}</Text>
              </View>
            ))}
          </View>

        </View>

        {/* --- ADVENTURE / JEEPNEY SECTION --- */}
        <View style={styles.promoCardWrapper}>
          <Image source={require('../../assets/logo/bee.png')} style={[styles.flyingBee, styles.bee1]} resizeMode="contain" />
          <Image source={require('../../assets/logo/bee.png')} style={[styles.flyingBee, styles.bee2]} resizeMode="contain" />
          <Image source={require('../../assets/logo/bee.png')} style={[styles.flyingBee, styles.bee3]} resizeMode="contain" />
          
          <View style={styles.promoCard}>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoLabel}>Learn more about</Text>
              <Text style={styles.promoBrand}>dialectGo</Text>

              {/* ✅ NAVIGATE TO LEARN/CHATBOT */}
              <TouchableOpacity
                style={styles.exploreBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/Learn/Learn')}
              >
                <Text style={styles.exploreBtnText}>Explore Now</Text>
              </TouchableOpacity>
            </View>
            <Image source={require('../../assets/logo/jeepLogo.png')} style={styles.jeepneyImageFixed} resizeMode="contain" />
          </View>
          <Image
            source={require('../../assets/images/jeepney.png')}
            style={styles.jeepneyImage}
            resizeMode="contain"
          />
        </View>

      </ScrollView>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={onNavigate} 
      /> 
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
