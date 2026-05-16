import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
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
import { styles } from '../../../shared/styles/TranslateStyles';
import { supabase } from '../../../shared/lib/supabase';

// Assets
import translateIcon from '../../../assets/icons/translateIcon.png';

const { width } = Dimensions.get('window');

// API Endpoints
const API_URL = 'http://192.168.1.53:5001/api/translate';
const FEEDBACK_URL = 'http://192.168.1.53:5001/api/feedback';

const LANGUAGES = [
  { name: 'English', id: 1 },
  { name: 'Tagalog', id: 2 },
  { name: 'Cebuano', id: 3 },
];

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
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [currentTranslationId, setCurrentTranslationId] = useState(null);

  // Feedback/Contribution State
  const [feedback, setFeedback] = useState(null); 
  const [comment, setComment] = useState('');
  const [suggestionText, setSuggestionText] = useState('');

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
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    setError(false);

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
          source_language_id: LANGUAGES.find(l => l.name === sourceLang)?.id, 
          target_language_id: LANGUAGES.find(l => l.name === targetLang)?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setTranslation(data.translatedText?.trim() || "");
        setCurrentTranslationId(data.historyRecord?.id || data.historyId);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
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
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <TopBar onMenuPress={() => {}} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Translate <Text style={styles.yellowText}>Now!</Text></Text>
              <Text style={styles.subHeader}>TEXT MODE</Text>
          </View>

          <LanguageSelector 
            sourceLang={sourceLang} targetLang={targetLang}
            onSwap={() => {
              const temp = sourceLang; setSourceLang(targetLang); setTargetLang(temp);
            }} 
            onSelectSource={() => { setSelectingFor('source'); setModalVisible(true); }}
            onSelectTarget={() => { setSelectingFor('target'); setModalVisible(true); }}
            translateIcon={translateIcon}
          />

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
                <Text style={styles.resultText}>{translation || "Waiting..."}</Text>
              )}
            </View>
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
    </SafeAreaView>
  );
}