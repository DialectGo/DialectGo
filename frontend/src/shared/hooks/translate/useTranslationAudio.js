import { useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { Audio, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { cleanBase64Audio } from '../../utils/stringUtils';
import { fetchTTS } from '../../services/translate/translationService';

export const useTranslationAudio = () => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync().catch(() => {}); };
  }, []);

  const playTranslatedAudio = async (text, lang) => {
    if (!text) return;
    if (isPlayingAudio && soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
      setIsPlayingAudio(false);
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      setIsPlayingAudio(true);

      const base64String = await fetchTTS(text, lang);
      const cleanBase64 = cleanBase64Audio(base64String);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, playsInSilentModeIOS: true,
        staysActiveInBackground: false, shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });

      const fileUri = `${FileSystem.cacheDirectory}tts_output.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, cleanBase64, { encoding: FileSystem.EncodingType.Base64 });

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri }, { shouldPlay: true, volume: 1.0 });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setIsPlayingAudio(false);
      });
    } catch (err) {
      console.error('[TTS Error]:', err);
      setIsPlayingAudio(false);
      Alert.alert('Playback Error', 'Could not generate audio for this translation.');
    }
  };

  const playBase64Audio = async (rawBase64) => {
    if (!rawBase64) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      setIsPlayingAudio(true);
      const cleanBase64 = cleanBase64Audio(rawBase64);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, playsInSilentModeIOS: true,
        staysActiveInBackground: false, shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });

      const fileUri = `${FileSystem.cacheDirectory}speech_result.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, cleanBase64, { encoding: FileSystem.EncodingType.Base64 });

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri }, { shouldPlay: true, volume: 1.0 });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setIsPlayingAudio(false);
      });
    } catch (err) {
      console.error('[Base64 Audio Playback Error]:', err);
      setIsPlayingAudio(false);
    }
  };

  return { isPlayingAudio, playTranslatedAudio, playBase64Audio, soundRef };
};
