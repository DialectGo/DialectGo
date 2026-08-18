import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
  LayoutAnimation,
  Clipboard,
} from 'react-native';
import { Audio, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import BottomNav from '../../../src/components/BottomNav';
import TopBar from '../../../src/components/TopBar';
import LanguageSelector from '../../../src/features/translator/components/LanguageSelector';
import ContributionModal from '../../../src/features/wiki/components/ContributionModal'; // Added Shared Component
import BreakdownPanel from '../../../src/features/translator/components/BreakdownPanel';
import LoadingModal from '../../../src/shared/components/LoadingModal';
import CustomizeModal from '../../../src/shared/components/CustomizeModal';
import DocumentUploadModal from '../../../src/features/translator/components/DocumentUploadModal';
import TranslationResultModal from '../../../src/features/translator/components/TranslationResultModal';
import SwipeableBottomSheet from '../../../src/shared/components/SwipeableBottomSheet';
import SpeechModal from '../../../src/features/translator/components/SpeechModal';
import { styles } from '../../../src/features/translator/styles/TranslateStyles';
import { supabase } from '../../../src/shared/api/supabase';

// Assets
import translateIcon from '../../../assets/icons/translateIcon.png';

const { width } = Dimensions.get('window');

// API Endpoints
import { TRANSLATION_API_BASE } from '../../../src/shared/api/client';
const API_URL = `${TRANSLATION_API_BASE}/translate`;
const FEEDBACK_URL = `${TRANSLATION_API_BASE}/feedback`;

const LANGUAGES = [
  { name: 'English', id: 1 },
  { name: 'Tagalog', id: 2 },
  { name: 'Cebuano', id: 3 },
];

// Dialect variant options per target language
const DIALECT_OPTIONS = {
  Cebuano: [{ label: 'Standard', value: null }, { label: 'Boholano', value: 'Boholano' }],
  Tagalog: [{ label: 'Standard', value: null }, { label: 'Batangeño', value: 'Batangeño' }],
};

export default function TranslateScreen({ activeTab, onNavigate }) {
  const { slide } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // UI State
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [speechModalVisible, setSpeechModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState('source');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  // Language & Text State
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [targetDialect, setTargetDialect] = useState(null);
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [currentTranslationId, setCurrentTranslationId] = useState(null);

  // Feedback/Contribution State
  const [feedback, setFeedback] = useState(null);
  const [comment, setComment] = useState('');
  const [suggestionText, setSuggestionText] = useState('');

  // LLM Meta-Layer State
  const [breakdownData, setBreakdownData] = useState(null);
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);
  const [breakdownPanelVisible, setBreakdownPanelVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [isCustomizeLoading, setIsCustomizeLoading] = useState(false);

  // TTS State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const soundRef = useRef(null);
  // When the speech modal delivers results directly, skip the debounce re-translation
  const skipDebounceRef = useRef(false);

  // Document Upload State
  const [docUploadVisible, setDocUploadVisible] = useState(false);
  const [docResultVisible, setDocResultVisible] = useState(false);
  const [isDocTranslating, setIsDocTranslating] = useState(false);
  const [docResult, setDocResult] = useState(null);
  const [docError, setDocError] = useState(false);
  // Keep the file URI alive so we can show the original in the result modal
  const [docFileUri, setDocFileUri] = useState(null);
  const [docFileMimeType, setDocFileMimeType] = useState(null);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => { soundRef.current?.unloadAsync().catch(() => {}); };
  }, []);

  // --- TTS ---
  const playTranslatedAudio = async (text, lang) => {
    if (!text) return;

    // If already playing, stop
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

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${TRANSLATION_API_BASE}/translate/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ text, lang }),
      });

      if (!response.ok) throw new Error('TTS request failed');
      const data = await response.json();
      const base64String = data.audioBase64;
      if (!base64String) throw new Error('No audio returned');

      const cleanBase64 = base64String
        .replace(/^data:audio\/(mp3|wav|m4a|aac);base64,/, '')
        .replace(/(\r\n|\n|\r)/gm, '');

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

  /**
   * Plays a raw base64 audio string directly (used for speech-to-text auto-playback).
   * This is different from playTranslatedAudio which calls the TTS endpoint first.
   */
  const playBase64Audio = async (rawBase64) => {
    if (!rawBase64) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }

      setIsPlayingAudio(true);

      const cleanBase64 = rawBase64
        .replace(/^data:audio\/(mp3|wav|m4a|aac);base64,/, '')
        .replace(/(\r\n|\n|\r)/gm, '');

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

  // --- Copy ---
  const handleCopy = () => {
    if (!translation) return;
    Clipboard.setString(translation);
    Alert.alert('Copied!', 'Translation copied to clipboard.');
  };

  // --- API HANDLERS ---

  const handleQuickRating = async (ratingValue) => {
    if (!currentTranslationId) return Alert.alert("Wait", "Translate something first.");

    setFeedback(ratingValue === 5 ? 'like' : 'unlike');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(FEEDBACK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          translationId: currentTranslationId,
          rating: ratingValue,
        })
      });
      setFeedbackModalVisible(true); // Open modal for further input
    } catch (err) {
      console.error("Feedback error", err);
    }
  };

  const handleDetailedSubmit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` };

      // 1. Submit Feedback Comment
      if (comment.trim()) {
        await fetch(FEEDBACK_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            translationId: currentTranslationId,
            rating: feedback === 'like' ? 5 : 1,
            comment: comment
          })
        });
      }

      // 2. Submit Suggested Translation
      if (suggestionText.trim()) {
        await fetch(`${API_URL}/contribute`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sourceText: inputText,
            userTranslation: suggestionText,
            sourceLang,
            targetLang,
            source_language_id: LANGUAGES.find(l => l.name === sourceLang)?.id,
            target_language_id: LANGUAGES.find(l => l.name === targetLang)?.id,
          })
        });
      }

      Alert.alert("Salamat!", "Nakatulong ka sa pag-improve ng DialectoGo.");
      setFeedbackModalVisible(false);
      setComment('');
      setSuggestionText('');
    } catch (err) {
      Alert.alert("Error", "Hindi maipadala ang feedback.");
    }
  };

  const handleTranslate = async (text) => {
    if (!text.trim()) {
      setTranslation('');
      setError(false);
      setBreakdownData(null);
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    setError(false);
    setBreakdownData(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          sourceText: text,
          sourceLang,
          targetLang,
          targetDialect,
          source_language_id: LANGUAGES.find(l => l.name === sourceLang)?.id,
          target_language_id: LANGUAGES.find(l => l.name === targetLang)?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setTranslation(data.translatedText?.trim() || "");
        setCurrentTranslationId(data.historyRecord?.id || data.historyId);
        if (data.breakdown) {
          setBreakdownData(data.breakdown);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowBreakdown = async () => {
    if (breakdownData) return; // Already loaded

    setIsBreakdownLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          sourceText: inputText,
          sourceLang,
          targetLang,
          targetDialect,
          source_language_id: LANGUAGES.find(l => l.name === sourceLang)?.id,
          target_language_id: LANGUAGES.find(l => l.name === targetLang)?.id,
          withBreakdown: true // Trigger the Meta-Layer
        }),
      });

      const data = await response.json();
      if (response.ok && data.breakdown) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBreakdownData(data.breakdown);
      }
    } catch (err) {
      console.error("Failed to fetch breakdown", err);
    } finally {
      setIsBreakdownLoading(false);
    }
  };

  const handleCustomizeSubmit = async (params) => {
    setIsCustomizeLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/customize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          sourceText: inputText,
          translatedText: translation,
          sourceLang,
          targetLang,
          ...params
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setTranslation(data.customizedText?.trim());
        setShowCustomize(false);
        // We could also set breakdownData here to reflect the new text, but we'd need a new breakdown.
        // For now, we clear the old breakdown.
        setBreakdownData(null);
      } else {
        Alert.alert("Error", data.message || "Failed to customize translation.");
      }
    } catch (err) {
      console.error("Customize error", err);
      Alert.alert("Error", "Could not reach customization service.");
    } finally {
      setIsCustomizeLoading(false);
    }
  };

  const handleDocumentSelected = async (fileAsset) => {
    console.log('[Translate] handleDocumentSelected fileAsset:', fileAsset);
    const getMimeType = (asset) => {
      if (asset.mimeType) return asset.mimeType;
      if (asset.uri?.toLowerCase().endsWith('.pdf')) return 'application/pdf';
      if (asset.uri?.toLowerCase().endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      return 'image/jpeg';
    };

    const mimeType = getMimeType(fileAsset);

    // Store file URI before upload so we can show the original in the result modal
    setDocFileUri(fileAsset.uri);
    setDocFileMimeType(mimeType);
    setDocResultVisible(true);
    setIsDocTranslating(true);
    setDocError(false);
    setDocResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append('file', {
        uri: fileAsset.uri,
        name: fileAsset.fileName || fileAsset.name || 'upload.jpg',
        type: mimeType,
      });
      formData.append('sourceLang', sourceLang);
      formData.append('targetLang', targetLang);
      if (targetDialect) formData.append('targetDialect', targetDialect);
      
      const srcId = LANGUAGES.find(l => l.name === sourceLang)?.id;
      const tgtId = LANGUAGES.find(l => l.name === targetLang)?.id;
      if (srcId) formData.append('source_language_id', srcId);
      if (tgtId) formData.append('target_language_id', tgtId);
      formData.append('withBreakdown', 'true');

      const response = await fetch(`${API_URL}/document`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setDocResult(data);
      } else {
        setDocError(true);
      }
    } catch (err) {
      console.error("[Translate] Document upload error:", err.message || err);
      setDocError(true);
    } finally {
      setIsDocTranslating(false);
      // NOTE: We do NOT delete the file here — it stays alive so
      // the result modal can display the original. Deleted when modal closes.
    }
  };

  // Debounce Effect
  useEffect(() => {
    // Skip re-translation if speech modal already provided the result directly
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      if (inputText) handleTranslate(inputText);
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [inputText, targetLang, sourceLang]);

  const selectLanguage = (langObj) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectingFor === 'source') {
      if (langObj.name === targetLang) setTargetLang(sourceLang);
      setSourceLang(langObj.name);
    } else {
      if (langObj.name === sourceLang) setSourceLang(targetLang);
      setTargetLang(langObj.name);
      // Reset dialect when target language changes
      setTargetDialect(null);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ animation: "fade" }} />
      <StatusBar style="dark" />
      <TopBar 
        titlePrimary="DialectGo" 
        titleSecondary="Translator" 
        screenType="translator"
        onHistoryPress={() => router.push('/History/History')}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top + 55 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.content}>

          <LanguageSelector
            sourceLang={sourceLang} targetLang={targetLang}
            onSwap={() => {
              const temp = sourceLang; setSourceLang(targetLang); setTargetLang(temp);
              setTargetDialect(null);
            }}
            onSelectSource={() => { setSelectingFor('source'); setModalVisible(true); }}
            onSelectTarget={() => { setSelectingFor('target'); setModalVisible(true); }}
            translateIcon={translateIcon}
          />


          {/* INPUT CARD */}
          <View style={styles.translateCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.inputLabel}>{sourceLang.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => { setInputText(''); setBreakdownData(null); }}>
                <Ionicons name="close-circle" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.mainInput}
              placeholder="Type something to translate..."
              placeholderTextColor="#9CA3AF"
              multiline value={inputText}
              onChangeText={setInputText}
            />
            <View style={styles.cardFooter}>
              <View style={[styles.shortcutIcons, { alignItems: 'center', gap: 8 }]}>
                <TouchableOpacity onPress={() => setDocUploadVisible(true)} style={styles.iconBtn}>
                  <Ionicons name="document-text" size={22} color="#1F2937" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSpeechModalVisible(true)} style={styles.iconBtn}>
                  <Ionicons name="mic" size={22} color="#1F2937" />
                </TouchableOpacity>
              </View>

              {/* DIALECT VARIANT SELECTOR */}
              {DIALECT_OPTIONS[targetLang] && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  {DIALECT_OPTIONS[targetLang].map((option) => (
                    <TouchableOpacity
                      key={option.label}
                      onPress={() => setTargetDialect(option.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 16,
                        backgroundColor: targetDialect === option.value ? '#FBBF24' : '#F3F4F6',
                        borderWidth: 1,
                        borderColor: targetDialect === option.value ? '#F59E0B' : '#E5E7EB',
                      }}
                    >
                      <Text style={{
                        fontSize: 11,
                        fontWeight: targetDialect === option.value ? '700' : '500',
                        color: targetDialect === option.value ? '#1F2937' : '#6B7280',
                      }}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* RESULT CARD */}
          {inputText.length > 0 && !error && (
            <View style={[styles.translateCard, styles.resultCardExtra]}>
              <View style={styles.cardHeader}>
                <Text style={styles.inputLabel}>{targetLang.toUpperCase()}</Text>
                {/* <Ionicons name="volume-high" size={20} color="#FBBF24" /> */}
              </View>
              {isLoading ? (
                <View style={styles.loadingArea}>
                  <ActivityIndicator size="small" color="#FBBF24" />
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultText}>{translation || "Waiting..."}</Text>
                  {/* Output Toolbar */}
                  {translation ? (
                    <View style={styles.outputToolbar}>
                      {/* Left: Speaker */}
                      <TouchableOpacity
                        onPress={() => playTranslatedAudio(translation, targetLang)}
                        style={styles.outputToolbarBtn}
                      >
                        <Ionicons
                          name={isPlayingAudio ? 'volume-high' : 'volume-medium-outline'}
                          size={20}
                          color={isPlayingAudio ? '#FBBF24' : '#1F2937'}
                        />
                      </TouchableOpacity>

                      {/* Right: Copy, Rate, More */}
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={handleCopy} style={[styles.outputToolbarBtn, { marginRight: 10 }]}>
                          <Ionicons name="copy-outline" size={20} color="#1F2937" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setRateModalVisible(true)}
                          style={[styles.outputToolbarBtn, { marginRight: 10 }]}
                        >
                          <MaterialIcons
                            name="thumbs-up-down"
                            size={20}
                            color={feedback ? '#FBBF24' : '#1F2937'}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setMoreMenuVisible(true)}
                          style={styles.outputToolbarBtn}
                        >
                          <Ionicons name="ellipsis-horizontal" size={20} color="#1F2937" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          )}

          {/* REVIEW BREAKDOWN BUTTON */}
          {inputText.length > 0 && breakdownData && !isLoading && (
            <TouchableOpacity 
              style={styles.reviewBreakdownBtn} 
              onPress={() => setBreakdownPanelVisible(true)}
            >
              <Ionicons name="bulb" size={20} color="#F59E0B" />
              <Text style={styles.reviewBreakdownText}>Review AI Breakdown</Text>
            </TouchableOpacity>
          )}

          {/* BREAKDOWN PANEL MODAL */}
          {breakdownData && (
            <BreakdownPanel
              visible={breakdownPanelVisible}
              onClose={() => setBreakdownPanelVisible(false)}
              breakdown={breakdownData}
              isLoading={isBreakdownLoading}
              onSelectAlternative={(text) => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setTranslation(text);
                setBreakdownData(null); // Clear breakdown since text changed
                setBreakdownPanelVisible(false);
              }}
            />
          )}

          <LoadingModal visible={isBreakdownLoading} message="Analyzing translation..." />

          {/* RATE MODAL */}
          <SwipeableBottomSheet visible={rateModalVisible} onClose={() => setRateModalVisible(false)}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 20 }}>Rate this translation</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => { handleQuickRating(5); setRateModalVisible(false); }}
                style={[styles.rateBtn, feedback === 'like' && styles.rateBtnActive]}
              >
                <Ionicons name="thumbs-up" size={26} color={feedback === 'like' ? '#FBBF24' : '#6B7280'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { handleQuickRating(1); setRateModalVisible(false); }}
                style={[styles.rateBtn, feedback === 'unlike' && styles.rateBtnActive]}
              >
                <Ionicons name="thumbs-down" size={26} color={feedback === 'unlike' ? '#FBBF24' : '#6B7280'} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
              Your feedback will be used to help improve the product
            </Text>
          </SwipeableBottomSheet>

          {/* THREE-DOTS MORE MENU */}
          <SwipeableBottomSheet visible={moreMenuVisible} onClose={() => setMoreMenuVisible(false)}>
            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => { setMoreMenuVisible(false); setFeedbackModalVisible(true); }}
            >
              <Ionicons name="create-outline" size={22} color="#374151" />
              <Text style={styles.moreMenuText}>Suggest Translation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => { setMoreMenuVisible(false); handleShowBreakdown(); }}
            >
              <Ionicons name="analytics-outline" size={22} color="#374151" />
              <Text style={styles.moreMenuText}>Breakdown</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => { setMoreMenuVisible(false); setShowCustomize(true); }}
            >
              <Ionicons name="color-wand-outline" size={22} color="#374151" />
              <Text style={styles.moreMenuText}>Customize</Text>
            </TouchableOpacity>
          </SwipeableBottomSheet>
        </View>
      </ScrollView>

      {/* SHARED CONTRIBUTION MODAL */}
      <ContributionModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        onSubmit={handleDetailedSubmit}
        feedbackComment={comment}
        setFeedbackComment={setComment}
        suggestedTranslation={suggestionText}
        setSuggestedTranslation={setSuggestionText}
      />

      {/* CUSTOMIZE MODAL */}
      <CustomizeModal
        visible={showCustomize}
        onClose={() => setShowCustomize(false)}
        onSubmit={handleCustomizeSubmit}
        isLoading={isCustomizeLoading}
      />

      {/* DOCUMENT UPLOAD MODAL */}
      <DocumentUploadModal 
        visible={docUploadVisible} 
        onClose={() => setDocUploadVisible(false)} 
        onFileSelected={handleDocumentSelected}
      />

      {/* DOCUMENT TRANSLATION RESULT MODAL */}
      <TranslationResultModal
        visible={docResultVisible}
        onClose={async () => {
          setDocResultVisible(false);
          // Clean up the cached file now that the modal is closed
          if (docFileUri) {
            try { await FileSystem.deleteAsync(docFileUri, { idempotent: true }); } catch (_) {}
            setDocFileUri(null);
            setDocFileMimeType(null);
          }
        }}
        isLoading={isDocTranslating}
        result={docResult}
        error={docError}
        fileUri={docFileUri}
        fileMimeType={docFileMimeType}
      />

      {/* LANGUAGE PICKER MODAL */}
      <SwipeableBottomSheet visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text style={styles.sheetTitle}>Select Language</Text>
        {LANGUAGES.map((item) => (
          <TouchableOpacity key={item.id} style={styles.sheetItem} onPress={() => selectLanguage(item)}>
            <Text style={[styles.sheetItemText, (selectingFor === 'source' ? sourceLang : targetLang) === item.name && styles.activeSheetText]}>
              {item.name}
            </Text>
            {(selectingFor === 'source' ? sourceLang : targetLang) === item.name && <Ionicons name="checkmark-circle" size={22} color="#FBBF24" />}
          </TouchableOpacity>
        ))}
      </SwipeableBottomSheet>

      {/* SPEECH MODAL */}
      <SpeechModal
        visible={speechModalVisible}
        onClose={() => setSpeechModalVisible(false)}
        sourceLang={sourceLang}
        targetLang={targetLang}
        onTranscript={(transcript) => {
          // Flag the debounce to skip — we already have the translation
          skipDebounceRef.current = true;
          setInputText(transcript);
        }}
        onTranslation={(translatedText) => {
          // Set the translation directly so it displays simultaneously with audio
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setTranslation(translatedText.trim());
        }}
        onAudioResult={(audioBase64) => {
          // Delay one frame so React can render the translation text first
          requestAnimationFrame(() => {
            playBase64Audio(audioBase64);
          });
        }}
      />

      <BottomNav activeTab={activeTab} setActiveTab={onNavigate} />
    </View>
  );
}