import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  LayoutAnimation, 
  Alert, 
  Image, 
  Animated, 
  StatusBar 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Components & Icons
import LanguageSelector from '../../../shared/components/LanguageSelector';
import ResultCard from '../../../shared/components/ResultCard';
import TopBar from '../../../shared/components/TopBar'; // Siguraduhing tama ang path
import translateIcon from '../../../assets/icons/translateIcon.png';
import pronounceIcon from '../../../assets/icons/pronounceIcon.png';

export default function SpeechToText() {
  const router = useRouter();
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('Good Morning ...'); 
  const [translatedText, setTranslatedText] = useState('Maayong Buntag');
  const [showResult, setShowResult] = useState(false);

  // Animation for the pulse effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const animateUI = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const toggleListening = () => {
    animateUI();
    setIsListening(!isListening);
    
    if (!isListening) {
      // Simulation of voice processing
      setTimeout(() => {
        setIsListening(false);
        setShowResult(true);
      }, 3000);
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      
      {/* 1. Standard TopBar */}
      <TopBar title="DialectGo" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 2. ALIGNED BACK BUTTON & INTRO (Gaya ng sa Vision Mode) */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#1F2937" />
          </TouchableOpacity>

          <View style={styles.introContainer}>
            <Text style={styles.introTitle}>
              Translate <Text style={styles.yellowText}>Now!</Text>
            </Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, isListening && { backgroundColor: '#EF4444' }]} />
              <Text style={styles.statusText}>{isListening ? 'Recording' : 'Voice Mode'}</Text>
            </View>
          </View>
          
          {/* Empty view for alignment balance */}
          <View style={{ width: 45 }} />
        </View>

        {/* Language Selection */}
        <LanguageSelector 
          sourceLang={sourceLang} 
          targetLang={targetLang}
          translateIcon={translateIcon}
          onSwap={() => { setSourceLang(targetLang); setTargetLang(sourceLang); }}
        />

        {/* Voice Pulse UI */}
        <View style={styles.pulseWrapper}>
          <Animated.View style={[styles.pulseOuter, { transform: [{ scale: pulseAnim }] }, isListening && styles.pulseActive]}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={toggleListening}
              style={styles.pulseCircle}
            >
              <View style={styles.innerCircle}>
                <Ionicons name={isListening ? "stop" : "mic"} size={70} color="#000" />
              </View>
              {/* Decorative Stars */}
              <Ionicons name="sparkles" size={24} color="#FFF" style={styles.star1} />
              <Ionicons name="star" size={18} color="#FFF" style={styles.star2} />
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.listeningText}>
            {isListening ? "Listening ..." : "Tap to Speak"}
          </Text>
          {isListening && <Text style={styles.subNote}>DialectGo is processing your voice...</Text>}
        </View>

        {/* Transcript UI */}
        {transcript && (
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptLabel}>{sourceLang.toUpperCase()}</Text>
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>
        )}

        {showResult && (
          <View style={styles.resultWrapper}>
            <ResultCard 
              translatedText={translatedText} 
              targetLang={targetLang} 
              onClose={() => { animateUI(); setShowResult(false); }}
              pronounceIcon={pronounceIcon}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 10 },

  // BAGONG HEADER SECTION (Aligned & Yellow)
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    marginTop: 10,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#FFD700', // Yellow Background
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  introContainer: { alignItems: 'center', flex: 1 },
  introTitle: { fontSize: 28, fontWeight: '900', color: '#111827' },
  yellowText: { color: '#FBBF24' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FBBF24', marginRight: 4 },
  statusText: { fontSize: 10, color: '#9CA3AF', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },

  // Voice Pulse UI
  pulseWrapper: { alignItems: 'center', marginVertical: 30 },
  pulseOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseActive: {
    backgroundColor: '#FDE68A',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  pulseCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#FFF',
  },
  innerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningText: { marginTop: 20, fontSize: 24, fontWeight: '800', color: '#1F2937' },
  subNote: { fontSize: 12, color: '#FBBF24', fontWeight: '700', marginTop: 8 },

  star1: { position: 'absolute', top: 20, right: 20 },
  star2: { position: 'absolute', bottom: 30, left: 20 },

  // Transcript UI
  transcriptContainer: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
  },
  transcriptLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  transcriptText: { fontSize: 22, fontWeight: '700', color: '#374151', textAlign: 'center', fontStyle: 'italic' },

  resultWrapper: { marginTop: 10 }
});