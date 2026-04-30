import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, LayoutAnimation, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import LanguageSelector from '../../../shared/components/LanguageSelector';
import ResultCard from '../../../shared/components/ResultCard';
import translateIcon from '../../../assets/icons/translateIcon.png';
import pronounceIcon from '../../../assets/icons/pronounceIcon.png';
import { supabase } from '../../../shared/lib/supabase';

const API_URL = 'http://192.168.0.104:5001/api/translate/audio';

export default function SpeechToText() {
  const router = useRouter();
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [recording, setRecording] = useState(null);

  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  useEffect(() => {
    return () => {
      if (recording) {
        try {
          recording.stopAndUnloadAsync();
        } catch (e) {
        }
      }
    };
  }, [recording]);

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please enable microphone access.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      animate();
      setIsListening(true);
      setTranscript('Speak now...');

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsListening(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    animate();
    setIsListening(false);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert("Authentication Required", "Please log in.");
        return;
      }
      
      // Stop and unload safely
      const status = await recording.getStatusAsync();
      if (status.isLoaded && status.isRecording) {
        await recording.stopAndUnloadAsync();
      }

      const uri = recording.getURI();
      setRecording(null);

      // Using the same FormData pattern as ARTranslator
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        type: 'audio/m4a',
        name: 'speech.m4a',
      });
      
      // Consistency: Ensure keys match your backend exactly
      formData.append('targetLang', targetLang);
      formData.append('sourceLang', sourceLang);
      formData.append('sourceText', ''); 

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${session.access_token}`
          // Do NOT set Content-Type header here; let React Native set it automatically
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.translation) {
        setTranslatedText(data.translation);
        setTranscript("Original speech processed");
        animate();
        setShowResult(true);
      }

    } catch (error) {
      console.error("Translation error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Speech</Text>
      </View>

      <LanguageSelector
        sourceLang={sourceLang}
        targetLang={targetLang}
        translateIcon={translateIcon}
        onSwap={() => { setSourceLang(targetLang); setTargetLang(sourceLang); }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Translate Now!</Text>
        </View>

        <TouchableOpacity
          style={[styles.pulseCircle, isListening && styles.pulseActive]}
          onPress={toggleListening}
          disabled={isLoading}
        >
          <View style={styles.innerCircle}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#B45309" />
            ) : (
              <Ionicons name="mic" size={80} color="#B45309" />
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.listeningText}>
          {isLoading ? "Processing..." : isListening ? "Listening ..." : "Tap to Speak"}
        </Text>

        {transcript ? (
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptLabel}>{sourceLang}</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        ) : null}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' },
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
  introContainer: { marginTop: 20, alignItems: 'center' },
  introTitle: { fontSize: 28, fontWeight: '900', color: '#D1D5DB' },
  introSub: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },
  pulseCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 40,
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
  },
  listeningText: { marginTop: 20, fontSize: 22, textAlign: 'center' },
  transcriptContainer: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
  },
  transcriptLabel: { fontSize: 12 },
  transcriptText: { fontSize: 20, textAlign: 'center' },
  resultContainer: { marginTop: 20 }
});