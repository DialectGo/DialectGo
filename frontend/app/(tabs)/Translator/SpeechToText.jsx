import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text, ScrollView,
  LayoutAnimation, Alert, Animated, StatusBar, ActivityIndicator, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

// Shared Utilities & Components
import { supabase } from '../../../shared/lib/supabase';
import LanguageSelector from '../../../shared/components/LanguageSelector';
import ResultCard from '../../../shared/components/ResultCard';
import TopBar from '../../../shared/components/TopBar';
import ContributionModal from '../../../shared/components/ContributionModal';

// Assets
import translateIcon from '../../../assets/icons/translateIcon.png';
import pronounceIcon from '../../../assets/icons/pronounceIcon.png';

import { TRANSLATION_API_BASE } from '../../../shared/config/apiConfig';
const ENDPOINTS = {
  AUDIO: `${TRANSLATION_API_BASE}/translate/audio`,
  FEEDBACK: `${TRANSLATION_API_BASE}/feedback`,
  CONTRIBUTE: `${TRANSLATION_API_BASE}/translate/contribute`,
};

const LANGUAGE_MAP = [
  { name: 'English', id: 1 },
  { name: 'Tagalog', id: 2 },
  { name: 'Cebuano', id: 3 },
];

export default function SpeechToText() {
  const router = useRouter();

  // Language & UI State
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState('source');

  // Logic & Result State
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [recording, setRecording] = useState(null);
  const [currentTranslationId, setCurrentTranslationId] = useState(null);

  // Speech Mode State (Speech-to-Text vs Speech-to-Speech)
  const [speechMode, setSpeechMode] = useState('speech-to-text'); // 'speech-to-text' | 'speech-to-speech'
  const [audioBase64, setAudioBase64] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const soundRef = useRef(null);

  // Feedback State
  const [feedback, setFeedback] = useState(null);
  const [isDetailedModalVisible, setIsDetailedModalVisible] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [suggestedTranslation, setSuggestedTranslation] = useState('');

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

  // Cleanup any loaded sound when the screen unmounts
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => { });
    };
  }, []);

  const animateUI = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  // --- API HANDLERS ---

  const handleQuickRating = async (ratingValue) => {
    if (!currentTranslationId) return Alert.alert("Wait", "Translate something first.");

    setFeedback(ratingValue === 5 ? 'like' : 'unlike');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(ENDPOINTS.FEEDBACK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ translationId: currentTranslationId, rating: ratingValue })
      });
      setIsDetailedModalVisible(true);
    } catch (err) { console.error("Feedback error:", err); }
  };

  const handleDetailedSubmit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` };

      if (feedbackComment.trim()) {
        await fetch(ENDPOINTS.FEEDBACK, {
          method: 'POST',
          headers,
          body: JSON.stringify({ translationId: currentTranslationId, rating: feedback === 'like' ? 5 : 1, comment: feedbackComment })
        });
      }

      if (suggestedTranslation.trim()) {
        await fetch(ENDPOINTS.CONTRIBUTE, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sourceText: transcript,
            userTranslation: suggestedTranslation,
            sourceLang, targetLang,
            source_language_id: LANGUAGE_MAP.find(l => l.name === sourceLang)?.id,
            target_language_id: LANGUAGE_MAP.find(l => l.name === targetLang)?.id,
          })
        });
      }

      Alert.alert("Salamat!", "Thank you for improving DialectoGo.");
      setIsDetailedModalVisible(false);
      setFeedbackComment('');
      setSuggestedTranslation('');
    } catch (err) { Alert.alert("Error", "Submission failed."); }
  };

  // --- AUDIO PLAYBACK (Speech-to-Speech) ---

  /**
   * Plays base64-encoded MP3 audio returned by the backend TTS pipeline.
   * Unloads any previously playing sound first to avoid overlapping playback
   * or leaking native audio resources.
   */
  const playTranslatedAudio = async (rawBase64) => {
    let base64Mp3 = rawBase64;

    // Handle case where base64 might be wrapped inside an object
    if (typeof rawBase64 === 'object' && rawBase64 !== null) {
      base64Mp3 = rawBase64.data || rawBase64.base64 || null;
    }

    if (!base64Mp3 || typeof base64Mp3 !== 'string') {
      Alert.alert('Audio unavailable', 'No audio was returned for this translation.');
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => { });
        soundRef.current = null;
      }

      setIsPlayingAudio(true);

      // Clean string to remove line breaks or extra quotes
      const cleanBase64 = base64Mp3.trim().replace(/(\r\n|\n|\r)/gm, "");

      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${cleanBase64}` },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      });
    } catch (err) {
      console.error('Audio playback error:', err);
      setIsPlayingAudio(false);
      Alert.alert('Playback Error', 'Could not play the translated audio.');
    }
  };

  // --- RECORDING LOGIC ---

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return Alert.alert('Mic Access Required');

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      animateUI();
      setIsListening(true);
      setShowResult(false);
      setFeedback(null);
      setAudioBase64(null);
      setTranscript('Speak now...');

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) { setIsListening(false); }
  };

  const stopRecording = async () => {
    if (!recording) return;
    animateUI();
    setIsListening(false);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const formData = new FormData();
      formData.append('audio', { uri, type: 'audio/m4a', name: 'speech.m4a' });
      formData.append('targetLang', targetLang);
      formData.append('sourceLang', sourceLang);
      formData.append('source_language_id', LANGUAGE_MAP.find(l => l.name === sourceLang)?.id);
      formData.append('target_language_id', LANGUAGE_MAP.find(l => l.name === targetLang)?.id);

      const response = await fetch(ENDPOINTS.AUDIO, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      const data = await response.json();

      if (response.ok && data.translation) {
        setTranslatedText(data.translation);
        setTranscript(data.transcript || "Speech captured");
        setAudioBase64(data.audioBase64 || null);

        // FIX: Check for historyId specifically for Audio results
        const recordId = data.historyId || data.historyRecord?.id || data.id;
        setCurrentTranslationId(recordId);

        animateUI();
        setShowResult(true);

        // Auto-play only when the user is in Speech-to-Speech mode
        if (speechMode === 'speech-to-speech') {
          await playTranslatedAudio(data.audioBase64);
        }
      } else {
        Alert.alert("Error", data.message || "Translation failed. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Audio processing failed.");
    } finally {
      setIsLoading(false);
      setRecording(null);
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      <TopBar title="DialectoGo" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.introContainer}>
            <Text style={styles.introTitle}>Translate <Text style={styles.yellowText}>Now!</Text></Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, (isListening || isLoading) && { backgroundColor: '#EF4444' }]} />
              <Text style={styles.statusText}>{isLoading ? 'Processing' : isListening ? 'Recording' : 'Voice Mode'}</Text>
            </View>
          </View>
          <View style={{ width: 45 }} />
        </View>

        <LanguageSelector
          sourceLang={sourceLang} targetLang={targetLang}
          translateIcon={translateIcon} onSwap={() => {
            const temp = sourceLang; setSourceLang(targetLang); setTargetLang(temp);
          }}
          onSelectSource={() => { setSelectingFor('source'); setModalVisible(true); }}
          onSelectTarget={() => { setSelectingFor('target'); setModalVisible(true); }}
        />

        {/* SPEECH MODE TOGGLE */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeToggleOption, speechMode === 'speech-to-text' && styles.modeToggleActive]}
            onPress={() => setSpeechMode('speech-to-text')}
          >
            <Text style={[styles.modeToggleText, speechMode === 'speech-to-text' && styles.modeToggleTextActive]}>
              Speech to Text
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeToggleOption, speechMode === 'speech-to-speech' && styles.modeToggleActive]}
            onPress={() => setSpeechMode('speech-to-speech')}
          >
            <Text style={[styles.modeToggleText, speechMode === 'speech-to-speech' && styles.modeToggleTextActive]}>
              Speech to Speech
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pulseWrapper}>
          <Animated.View style={[styles.pulseOuter, { transform: [{ scale: pulseAnim }] }, isListening && styles.pulseActive]}>
            <TouchableOpacity onPress={isListening ? stopRecording : startRecording} style={styles.pulseCircle} disabled={isLoading}>
              <View style={styles.innerCircle}>
                {isLoading ? <ActivityIndicator size="large" color="#FFF" /> : <Ionicons name={isListening ? "stop" : "mic"} size={70} color="#000" />}
              </View>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.listeningText}>{isLoading ? "Analyzing..." : isListening ? "Listening..." : "Tap to Speak"}</Text>
        </View>

        {transcript !== '' && (
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptLabel}>{sourceLang.toUpperCase()}</Text>
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>
        )}

        {showResult && (
          <View style={styles.resultWrapper}>
            <ResultCard translatedText={translatedText} targetLang={targetLang} onClose={() => setShowResult(false)} pronounceIcon={pronounceIcon} />

            {speechMode === 'speech-to-speech' && audioBase64 && (
              <TouchableOpacity
                style={styles.replayButton}
                onPress={() => playTranslatedAudio(audioBase64)}
                disabled={isPlayingAudio}
              >
                <Ionicons name={isPlayingAudio ? "volume-high" : "play"} size={18} color="#FBBF24" />
                <Text style={styles.replayButtonText}>{isPlayingAudio ? 'Playing...' : 'Replay Audio'}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.feedbackContainer}>
              <View style={styles.feedbackIcons}>
                <TouchableOpacity onPress={() => handleQuickRating(5)} style={styles.miniFeedbackBtn}>
                  <Ionicons name="thumbs-up" size={18} color={feedback === 'like' ? "#FBBF24" : "#9CA3AF"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleQuickRating(1)} style={styles.miniFeedbackBtn}>
                  <Ionicons name="thumbs-down" size={18} color={feedback === 'unlike' ? "#FBBF24" : "#9CA3AF"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsDetailedModalVisible(true)} style={styles.miniFeedbackBtn}>
                  <Ionicons name="create-outline" size={20} color="#FBBF24" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* REUSABLE CONTRIBUTION MODAL */}
      <ContributionModal
        visible={isDetailedModalVisible}
        onClose={() => setIsDetailedModalVisible(false)}
        onSubmit={handleDetailedSubmit}
        feedbackComment={feedbackComment}
        setFeedbackComment={setFeedbackComment}
        suggestedTranslation={suggestedTranslation}
        setSuggestedTranslation={setSuggestedTranslation}
      />

      {/* LANGUAGE PICKER */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Language</Text>
            {LANGUAGE_MAP.map((item) => (
              <TouchableOpacity key={item.id} style={styles.sheetItem} onPress={() => {
                animateUI();
                if (selectingFor === 'source') {
                  if (item.name === targetLang) setTargetLang(sourceLang);
                  setSourceLang(item.name);
                } else {
                  if (item.name === sourceLang) setSourceLang(targetLang);
                  setTargetLang(item.name);
                }
                setModalVisible(false);
                setShowResult(false);
              }}>
                <Text style={[styles.sheetItemText, (selectingFor === 'source' ? sourceLang : targetLang) === item.name && styles.activeSheetText]}>{item.name}</Text>
                {(selectingFor === 'source' ? sourceLang : targetLang) === item.name && <Ionicons name="checkmark-circle" size={22} color="#FBBF24" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeSheet} onPress={() => setModalVisible(false)}><Text style={styles.closeSheetText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 10 },
  headerSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  backButton: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center' },
  introContainer: { alignItems: 'center', flex: 1 },
  introTitle: { fontSize: 28, fontWeight: '900', color: '#111827' },
  yellowText: { color: '#FBBF24' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FBBF24', marginRight: 4 },
  statusText: { fontSize: 10, color: '#9CA3AF', fontWeight: '800', textTransform: 'uppercase' },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 10,
  },
  modeToggleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeToggleActive: {
    backgroundColor: '#FBBF24',
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
  },
  pulseWrapper: { alignItems: 'center', marginVertical: 30 },
  pulseOuter: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
  pulseActive: { backgroundColor: '#FDE68A', elevation: 15 },
  pulseCircle: { width: 170, height: 170, borderRadius: 85, backgroundColor: '#FBBF24', justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: '#FFF' },
  innerCircle: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  listeningText: { marginTop: 20, fontSize: 24, fontWeight: '800', color: '#1F2937' },
  transcriptContainer: { backgroundColor: '#F9FAFB', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 20 },
  transcriptLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  transcriptText: { fontSize: 22, fontWeight: '700', color: '#374151', textAlign: 'center', fontStyle: 'italic' },
  resultWrapper: { marginTop: 10 },
  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  replayButtonText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 13,
  },
  feedbackContainer: { marginTop: 15, alignItems: 'center' },
  feedbackIcons: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  miniFeedbackBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F9FAFB' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 20, textAlign: 'center' },
  sheetItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sheetItemText: { fontSize: 18, fontWeight: '600', color: '#4B5563' },
  activeSheetText: { color: '#FBBF24', fontWeight: '800' },
  closeSheet: { marginTop: 20, alignItems: 'center', padding: 15, backgroundColor: '#F9FAFB', borderRadius: 15 },
  closeSheetText: { color: '#9CA3AF', fontWeight: '700', fontSize: 16 },
});