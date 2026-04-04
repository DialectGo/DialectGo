import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, LayoutAnimation, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../../shared/lib/supabase';

// Components & Icons
import LanguageSelector from '../../../shared/components/LanguageSelector';
import ResultCard from '../../../shared/components/ResultCard';
import translateIcon from '../../../assets/icons/translateIcon.png';
import pronounceIcon from '../../../assets/icons/pronounceIcon.png';

const API_URL = 'http://192.168.1.43:5001/api/translate'; // Reusing your translation logic

// --- Sub-components ---

function VoicePulse({ isListening, onToggle }) {
  return (
    <View style={styles.pulseWrapper}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={onToggle}
        style={[styles.pulseCircle, isListening && styles.pulseActive]}
      >
        <View style={styles.innerCircle}>
          <Ionicons name="mic" size={80} color="#B45309" />
        </View>
        {/* Decorative sparkles/stars matching your screenshot */}
        <Ionicons name="star" size={24} color="rgba(255,255,255,0.8)" style={styles.star1} />
        <Ionicons name="star" size={18} color="rgba(255,255,255,0.6)" style={styles.star2} />
      </TouchableOpacity>
      
      <Text style={styles.listeningText}>
        {isListening ? "Listening ..." : "Tap to Speak"}
      </Text>
      {isListening && (
        <Text style={styles.subNote}>*Recording in progress...*</Text>
      )}
    </View>
  );
}

function TranscriptArea({ transcript }) {
  if (!transcript) return null;
  return (
    <View style={styles.transcriptContainer}>
      <Text style={styles.transcriptLabel}>English</Text>
      <Text style={styles.transcriptText}>{transcript}</Text>
      <View style={styles.textUnderline} />
    </View>
  );
}

// --- Main Export ---

export default function SpeechToText() {
  const router = useRouter();
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('Good Morning ...'); // Initial state matching screenshot
  const [translatedText, setTranslatedText] = useState('Maayong Buntag');
  const [showResult, setShowResult] = useState(false);

  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const toggleListening = () => {
    animate();
    setIsListening(!isListening);
    
    // Logic for Voice Recognition would go here
    if (!isListening) {
      // Simulate stopping and showing result
      setTimeout(() => {
        setIsListening(false);
        setShowResult(true);
      }, 3000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Speech / Voice</Text>
      </View>

      <LanguageSelector 
        sourceLang={sourceLang} targetLang={targetLang}
        translateIcon={translateIcon}
        onSwap={() => { setSourceLang(targetLang); setTargetLang(sourceLang); }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Translate Now!</Text>
          <Text style={styles.introSub}>You can translate ideas into more connective way.</Text>
        </View>

        <VoicePulse isListening={isListening} onToggle={toggleListening} />

        <TranscriptArea transcript={transcript} />

        {showResult && (
          <View style={styles.resultContainer}>
            <ResultCard 
              translatedText={translatedText} 
              targetLang={targetLang} 
              onClose={() => { animate(); setShowResult(false); }}
              pronounceIcon={pronounceIcon}
            />
          </View>
        )}
      </ScrollView>
      
      {/* Footer Navigation or Actions could go here */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' }, // Grayish background from screenshot
  header: { 
    backgroundColor: '#FBBF24', 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4B5563' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },

  // Intro Text
  introContainer: { marginTop: 20, alignItems: 'center' },
  introTitle: { fontSize: 28, fontWeight: '900', color: '#D1D5DB', opacity: 0.8 },
  introSub: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },

  // Voice Pulse UI
  pulseWrapper: { alignItems: 'center', marginVertical: 40 },
  pulseCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#FBBF24',
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  pulseActive: {
    transform: [{ scale: 1.05 }],
    backgroundColor: '#F59E0B',
  },
  innerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  listeningText: { marginTop: 20, fontSize: 22, fontWeight: 'bold', color: '#374151' },
  subNote: { fontSize: 10, color: '#EF4444', textAlign: 'center', marginTop: 5 },

  // Sparkle stars positioning
  star1: { position: 'absolute', top: 30, right: 40 },
  star2: { position: 'absolute', bottom: 50, left: 30 },

  // Transcript UI
  transcriptContainer: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
    elevation: 3,
  },
  transcriptLabel: { fontSize: 12, color: '#92400E', marginBottom: 5 },
  transcriptText: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
  textUnderline: { height: 2, backgroundColor: '#1F2937', width: '80%', alignSelf: 'center', marginTop: 5 },

  resultContainer: { marginTop: 20 }
});