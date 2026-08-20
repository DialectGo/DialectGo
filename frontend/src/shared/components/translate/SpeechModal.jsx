import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '../../../shared/api/supabase';
import SwipeableBottomSheet from '../../../shared/components/SwipeableBottomSheet';
import { TRANSLATION_API_BASE } from '../../../shared/api/client';

const LANGUAGE_MAP = [
  { name: 'English', id: 1 },
  { name: 'Tagalog', id: 2 },
  { name: 'Cebuano', id: 3 },
];

const AUDIO_ENDPOINT = `${TRANSLATION_API_BASE}/translate/audio`;

/**
 * SpeechModal — A reusable SwipeableBottomSheet that presents the animated
 * "Tap to Speak" mic button.
 *
 * Props:
 *  - visible (bool)
 *  - onClose ()
 *  - sourceLang (string) — from parent Translate screen
 *  - targetLang (string) — from parent Translate screen
 *  - onTranscript (string) — called with the transcribed text
 *  - onAudioResult (string) — called with the base64 audio from the API
 */
export default function SpeechModal({
  visible,
  onClose,
  sourceLang,
  targetLang,
  onTranscript,
  onTranslation,
  onAudioResult,
}) {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef(null);

  // Cleanup: stop recording & animation on unmount / close
  useEffect(() => {
    if (!visible) {
      stopEverything();
    }
  }, [visible]);

  useEffect(() => {
    if (isListening) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current.start();
    } else {
      pulseLoopRef.current?.stop();
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const stopEverything = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (_) {}
    }
    setRecording(null);
    setIsListening(false);
    setIsLoading(false);
  };

  const handleClose = async () => {
    await stopEverything();
    onClose();
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert('Mic Access Required', 'Please allow microphone access to use voice input.');
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      setIsListening(true);

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
    } catch (err) {
      console.error('[SpeechModal] startRecording error:', err);
      setIsListening(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsListening(false);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      const formData = new FormData();
      formData.append('audio', { uri, type: 'audio/m4a', name: 'speech.m4a' });
      formData.append('targetLang', targetLang);
      formData.append('sourceLang', sourceLang);
      formData.append('source_language_id', LANGUAGE_MAP.find(l => l.name === sourceLang)?.id ?? 1);
      formData.append('target_language_id', LANGUAGE_MAP.find(l => l.name === targetLang)?.id ?? 2);

      const response = await fetch(AUDIO_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      const data = await response.json();

      if (response.ok && data.translation) {
        const transcript = data.transcript || 'Speech captured';

        // 1. Send transcript -> parent sets inputText
        onTranscript?.(transcript);

        // 2. Send the translated text directly -> parent sets translation state
        //    (bypasses the debounce re-translation cycle)
        onTranslation?.(data.translation);

        // 3. Send audioBase64 -> parent auto-plays after render
        if (data.audioBase64) {
          onAudioResult?.(data.audioBase64);
        }

        // Close modal after delivering results
        onClose();
      } else {
        Alert.alert('Error', data.message || 'Translation failed. Please try again.');
      }
    } catch (err) {
      console.error('[SpeechModal] stopRecording error:', err);
      Alert.alert('Error', 'Audio processing failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicPress = () => {
    if (isLoading) return;
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const statusLabel = isLoading
    ? 'Analyzing...'
    : isListening
    ? 'Listening...'
    : 'Tap to Speak';

  return (
    <SwipeableBottomSheet visible={visible} onClose={handleClose}>
      {/* Status badge */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, isListening && styles.statusDotActive]} />
        <Text style={styles.statusText}>
          {isLoading ? 'Processing' : isListening ? 'Recording' : 'Voice Mode'}
        </Text>
      </View>

      {/* Animated Mic Button */}
      <View style={styles.pulseWrapper}>
        <Animated.View
          style={[
            styles.pulseOuter,
            { transform: [{ scale: pulseAnim }] },
            isListening && styles.pulseActive,
          ]}
        >
          <TouchableOpacity
            onPress={handleMicPress}
            style={styles.pulseCircle}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <View style={styles.innerCircle}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#FFF" />
              ) : (
                <Ionicons
                  name={isListening ? 'stop' : 'mic'}
                  size={56}
                  color="#000"
                />
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.listeningText}>{statusLabel}</Text>
        <Text style={styles.hintText}>
          {isListening
            ? 'Tap to stop recording'
            : isLoading
            ? 'Please wait...'
            : `Speaking in ${sourceLang} \u2192 ${targetLang}`}
        </Text>
      </View>
    </SwipeableBottomSheet>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
  },
  statusDotActive: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pulseWrapper: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 32,
  },
  pulseOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseActive: {
    backgroundColor: '#FDE68A',
    elevation: 15,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  pulseCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFF',
  },
  innerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningText: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  hintText: {
    marginTop: 6,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
