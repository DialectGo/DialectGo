import React from 'react'; 
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import ang styles at ang mga components
import { styles } from '../../shared/styles/HomeStyles';
import TopBar from '../../shared/components/TopBar'; 
import BottomNav from '../../shared/components/BottomNav';

export default function Home({ onNavigate, activeTab }) {

  return (
    <View style={{ flex: 1, backgroundColor: '#FFD54F' }}>
      {/* Para maging dilaw ang status bar area sa taas */}
      <StatusBar style="dark" backgroundColor="#FFD54F" translucent={false} />

      {/* 1. TOPBAR - Nasa itaas ng SafeAreaView */}
      <TopBar 
        onLogout={() => console.log("Logout")}
        onProfile={() => console.log("Profile")}
      />

      <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: '#FFFFFF' }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        >
          {/* --- WELCOME HEADER SECTION --- */}
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.helloText}>Maayong Buntag,</Text>
              <Text style={styles.userName}>Maria Clara</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>• Online</Text>
              </View>
            </View>

            <View style={styles.avatarWrapper}>
              <Image
                source={require('../../assets/avatars/1.png')}
                style={styles.avatarMain}
              />
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lvl 5</Text>
              </View>
            </View>
          </View>

          {/* --- DISCOVER SECTION --- */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Discover</Text>
            <View style={styles.titleAccent} />
            <View style={styles.discoverBadge}>
              <Text style={styles.discoverBadgeText}>New</Text>
            </View>
          </View>

          <View style={styles.wordCard}>
            <Text style={styles.wordLabel}>Word of the day</Text>
            <Text style={styles.wordText}>“Puhon”</Text>
            <View style={styles.wordDetails}>
              <Text style={styles.meaningText}>Meaning: Soon / Hopefully</Text>
              <Text style={styles.usageText}>"Magkita ta puhon"</Text>
            </View>
          </View>

          {/* --- PROGRESS / STREAK SECTION --- */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.titleAccentOrange} />
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>Active</Text>
            </View>
          </View>

          <View style={styles.largeStreakCard}>
            <View style={styles.streakTopRow}>
              <View style={styles.streakTextGroup}>
                <Text style={styles.streakNumberLarge}>24</Text>
                <Text style={styles.streakStatus}>DAY STREAK</Text>
                <View style={styles.onFireBadge}>
                  <Text style={styles.onFireText}>🔥 SUPER STREAK!</Text>
                </View>
              </View>

              <View style={styles.tripleFlameWrapper}>
                <Image source={require('../../assets/images/flame.png')} style={[styles.sideFlame, styles.leftFlame]} resizeMode="contain" />
                <Image source={require('../../assets/images/flame.png')} style={styles.centerFlame} resizeMode="contain" />
                <Image source={require('../../assets/images/flame.png')} style={[styles.sideFlame, styles.rightFlame]} resizeMode="contain" />
              </View>
            </View>

            <View style={styles.largeWeekRow}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
                <View key={index} style={styles.largeDayBox}>
                  <View style={[styles.dayCircleLarge, index < 4 ? styles.dayActive : styles.dayInactive]}>
                    {index < 4 ? <Text style={styles.checkMarkLarge}>✓</Text> : <Text style={styles.lockIcon}>🔒</Text>}
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
                <TouchableOpacity style={styles.exploreBtn} activeOpacity={0.8}>
                  <Text style={styles.exploreBtnText}>Explore Now</Text>
                </TouchableOpacity>
              </View>
              <Image source={require('../../assets/logo/jeepLogo.png')} style={styles.jeepneyImageFixed} resizeMode="contain" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 2. BOTTOMNAV - Floating sa ibaba */}
      <BottomNav />
    </View>
  );
}