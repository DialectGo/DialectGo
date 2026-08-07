import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
  LayoutAnimation
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../../../shared/components/BottomNav';
import TopBar from '../../../shared/components/TopBar';
import LanguageSelector from '../../../shared/components/LanguageSelector';
import ContributionModal from '../../../shared/components/ContributionModal'; // Added Shared Component
import BreakdownPanel from '../../../shared/components/BreakdownPanel';
import CustomizeModal from '../../../shared/components/CustomizeModal';
import { styles } from '../../../shared/styles/TranslateStyles';
import { supabase } from '../../../shared/lib/supabase';

// Assets
import translateIcon from '../../../assets/icons/translateIcon.png';

const { width } = Dimensions.get('window');

// API Endpoints
import { TRANSLATION_API_BASE } from '../../../shared/config/apiConfig';
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
  const router = useRouter();

  // UI State
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
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
  const [showCustomize, setShowCustomize] = useState(false);
  const [isCustomizeLoading, setIsCustomizeLoading] = useState(false);

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

  // Debounce Effect
  useEffect(() => {
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
      <StatusBar style="dark" />
      <TopBar onMenuPress={() => { }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Translate <Text style={styles.yellowText}>Now!</Text></Text>
            <TouchableOpacity onPress={() => router.push('/History/History')} style={{ padding: 8 }}>
              <Ionicons name="time-outline" size={26} color="#FBBF24" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subHeader}>TEXT MODE</Text>

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

          {/* DIALECT VARIANT SELECTOR */}
          {DIALECT_OPTIONS[targetLang] && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
              marginBottom: 12,
              gap: 12,
            }}>
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginRight: 4 }}>Output:</Text>
              {DIALECT_OPTIONS[targetLang].map((option) => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => setTargetDialect(option.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    backgroundColor: targetDialect === option.value ? '#FBBF24' : '#F3F4F6',
                    borderWidth: 1.5,
                    borderColor: targetDialect === option.value ? '#F59E0B' : '#E5E7EB',
                  }}
                >
                  <View style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: targetDialect === option.value ? '#1F2937' : '#9CA3AF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 6,
                  }}>
                    {targetDialect === option.value && (
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#1F2937',
                      }} />
                    )}
                  </View>
                  <Text style={{
                    fontSize: 13,
                    fontWeight: targetDialect === option.value ? '700' : '500',
                    color: targetDialect === option.value ? '#1F2937' : '#6B7280',
                  }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* INPUT CARD */}
          <View style={styles.translateCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.inputLabel}>{sourceLang.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => setInputText('')}>
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
              <View style={styles.shortcutIcons}>
                <TouchableOpacity onPress={() => router.push('/Translator/LiveCamera')} style={styles.iconBtn}>
                  <Ionicons name="camera" size={22} color="#1F2937" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/Translator/SpeechToText')} style={styles.iconBtn}>
                  <Ionicons name="mic" size={22} color="#1F2937" />
                </TouchableOpacity>
              </View>
              <Text style={styles.charCount}>{inputText.length} characters</Text>
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
                  {/* Meta-Layer Action Row */}
                  {translation ? (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#FEF3C7',
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 16,
                          gap: 4,
                          borderWidth: 1,
                          borderColor: '#FDE68A',
                        }}
                        onPress={handleShowBreakdown}
                        disabled={isBreakdownLoading}
                      >
                        {isBreakdownLoading ? (
                          <ActivityIndicator size="small" color="#D97706" />
                        ) : (
                          <Ionicons name="analytics-outline" size={16} color="#D97706" />
                        )}
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#D97706' }}>
                          {isBreakdownLoading ? 'Analyzing...' : 'Breakdown'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#F5F3FF',
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 16,
                          gap: 4,
                          borderWidth: 1,
                          borderColor: '#E9D5FF',
                        }}
                        onPress={() => setShowCustomize(true)}
                      >
                        <Ionicons name="color-wand-outline" size={16} color="#7C3AED" />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#7C3AED' }}>Customize</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          )}

          {/* BREAKDOWN PANEL */}
          {breakdownData && !isLoading && (
            <BreakdownPanel
              breakdown={breakdownData}
              isLoading={isBreakdownLoading}
              onSelectAlternative={(text) => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setTranslation(text);
                setBreakdownData(null); // Clear breakdown since text changed
              }}
            />
          )}

          {/* FEEDBACK ICONS */}
          {inputText.length > 0 && !isLoading && translation && (
            <View style={styles.feedbackContainer}>
              <View style={styles.feedbackIcons}>
                <TouchableOpacity onPress={() => handleQuickRating(5)} style={styles.miniFeedbackBtn}>
                  <Ionicons name="thumbs-up" size={18} color={feedback === 'like' ? "#FBBF24" : "#9CA3AF"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleQuickRating(1)} style={styles.miniFeedbackBtn}>
                  <Ionicons name="thumbs-down" size={18} color={feedback === 'unlike' ? "#FBBF24" : "#9CA3AF"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFeedbackModalVisible(true)} style={styles.miniFeedbackBtn}>
                  <Ionicons name="create-outline" size={20} color="#FBBF24" />
                </TouchableOpacity>
              </View>
            </View>
          )}
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

      {/* LANGUAGE PICKER MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Language</Text>
            {LANGUAGES.map((item) => (
              <TouchableOpacity key={item.id} style={styles.sheetItem} onPress={() => selectLanguage(item)}>
                <Text style={[styles.sheetItemText, (selectingFor === 'source' ? sourceLang : targetLang) === item.name && styles.activeSheetText]}>
                  {item.name}
                </Text>
                {(selectingFor === 'source' ? sourceLang : targetLang) === item.name && <Ionicons name="checkmark-circle" size={22} color="#FBBF24" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeSheet} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeSheetText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav activeTab={activeTab} setActiveTab={onNavigate} />
    </View>
  );
}