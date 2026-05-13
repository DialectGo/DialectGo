import React from 'react';
import { Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import BottomNav from '../../../shared/components/BottomNav';
import TopBar from '../../../shared/components/TopBar';
import { styles } from '../../../shared/styles/GamesStyles';

export default function Games({ activeTab, onNavigate }) {
  const forcedActiveTab = "Games";
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Ginawa nating translucent para sumagad ang background sa pinakataas */}
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* TOPBAR: Inilagay natin sa labas ng ScrollView para fixed sa taas tulad ng Dictionary */}
      <TopBar onMenuPress={() => console.log("Menu Pressed!")} />

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.textContainerHeader}>
              <Text style={styles.headerTitle}>
                Dialect <Text style={styles.yellowText}>Playground</Text>
              </Text>
              <View style={styles.titleUnderline} />
            </View>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeSub}>
              Master Cebuano and Tagalog through fun challenges.
            </Text>
          </View>

          {/* Word Bridge Card */}
          <View style={[styles.gameCard, { borderLeftColor: '#FF9800', borderLeftWidth: 8 }]}>
            <View style={styles.cardInfo}>
              <View style={[styles.iconBox, { backgroundColor: '#FF980020' }]}>
                <Text style={{ fontSize: 30 }}>🌉</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.gameTitle}>Word Bridge</Text>
                <Text style={styles.gameDesc}>Connect words to form meaningful sentences.</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.getBtn, { backgroundColor: '#FF9800' }]}
               onPress={() => router.push('/Games/WordBridge/WordBridgeHome')} 
              activeOpacity={0.8}
            >
              <Text style={styles.getBtnText}>GET STARTED</Text>
            </TouchableOpacity>
          </View>

          {/* Word Matcher Card */}
          <View style={[styles.gameCard, { borderLeftColor: '#2196F3', borderLeftWidth: 8 }]}>
            <View style={styles.cardInfo}>
              <View style={[styles.iconBox, { backgroundColor: '#2196F320' }]}>
                <Text style={{ fontSize: 30 }}>🧩</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.gameTitle}>Word Matcher</Text>
                <Text style={styles.gameDesc}>Match words in different languages to improve your vocabulary.</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.getBtn, { backgroundColor: '#2196F3' }]}
              onPress={() => router.push('/Games/WordMatcher/WordMatcherHome')}
              activeOpacity={0.8}
            >
              <Text style={styles.getBtnText}>GET STARTED</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>More games coming soon...</Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav activeTab={forcedActiveTab} setActiveTab={onNavigate} />
    </View>
  );
}