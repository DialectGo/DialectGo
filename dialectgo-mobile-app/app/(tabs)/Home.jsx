import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Surface, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import dictionaryIcon from '../../assets/icons/dictionaryIcon.png';
import translateIcon from '../../assets/icons/translateIcon.png';
import learnIcon from '../../assets/icons/chatbotIcon.png';
import gameIcon from '../../assets/icons/gameIcon.png';

export default function Home() {
  const categories = [
    { label: 'Dictionary', icon: dictionaryIcon },
    { label: 'Translate', icon: translateIcon },
    { label: 'Learn', icon: learnIcon },
    { label: 'Games', icon: gameIcon },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileContainer}>
          <Avatar.Icon size={40} icon="account" backgroundColor="white" color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeText}>Hi, John Doe</Text>
        <View style={styles.categoryRow}>
          {categories.map((item, index) => (
            <View key={index} style={styles.categoryItem}>
              <TouchableOpacity style={styles.categoryCircle}>
                <Image source={item.icon} style={styles.iconImage} />
              </TouchableOpacity>
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statsCard, { backgroundColor: '#FFB800' }]} />
          <Surface style={[styles.statsCard, styles.streakCard]} elevation={0}>
             <Text style={styles.streakSmallText}>You are in</Text>
             <View style={styles.streakInfo}>
                <Text style={styles.streakNumber}>24</Text>
                <Text style={styles.flameIcon}>🔥</Text>
             </View>
             <Text style={styles.streakMainText}>days streak</Text>
             <Text style={styles.streakSubText}>Keep learning for another streak.</Text>
          </Surface>
        </View>
        <Surface style={styles.wordCard} elevation={1}>
          <Text style={styles.wordCardTitle}>Word of the day!</Text>
          <Text style={styles.mainWord}>Ngani</Text>
          <Text style={styles.subWord}>"Pagod na ngani"</Text>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFCB45',
    height: 70,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  statusBarMock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -20,
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  notch: {
    width: 25,
    height: 25,
    backgroundColor: '#333',
    borderRadius: 12.5,
    position: 'absolute',
    left: '50%',
    marginLeft: -12.5,
  },
  profileContainer: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  scrollContent: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#5D4037',
    marginBottom: 30,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  categoryItem: {
    alignItems: 'center',
    width: '22%',
  },
  categoryCircle: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#FFCB45',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconImage: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  categoryLabel: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    width: '48%',
    height: 150,
    borderRadius: 20,
  },
  streakCard: {
    backgroundColor: '#FFCB45',
    padding: 15,
    justifyContent: 'center',
  },
  streakSmallText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#5D4037',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: 50,
    fontWeight: '900',
    color: '#333',
  },
  flameIcon: {
    fontSize: 35,
    marginLeft: 5,
  },
  streakMainText: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: -10,
  },
  streakSubText: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  wordCard: {
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    marginTop: 10,
  },
  wordCardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#5D4037',
    marginBottom: 20,
  },
  mainWord: {
    fontSize: 60,
    fontWeight: '900',
    color: '#333',
    marginBottom: 20,
  },
  subWord: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#5D4037',
  },
});