import React, { useState, useCallback, useMemo, useEffect} from 'react';
import { View, Keyboard, KeyboardAvoidingView, Platform, LayoutAnimation, ScrollView, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TextShadow from '../../../shared/components/TextShadow';
import LanguageSelector from '../../../shared/components/LanguageSelector';
import TranslationInput from '../../../shared/components/TranslationInput';
import ResultCard from '../../../shared/components/ResultCard';
import cameraIcon from '../../../assets/icons/cameraIcon.png';
import micIcon from '../../../assets/icons/micIcon.png';
import translateIcon from '../../../assets/icons/translateIcon.png';
import pronounceIcon from '../../../assets/icons/pronounceIcon.png';
import { supabase } from '../../../shared/lib/supabase';

const API_URL = 'https://lateritic-vocally-steffanie.ngrok-free.dev/api/translate';
const FEEDBACK_URL = 'http://192.168.1.50:5000/api/feedback';
const HEIGHT_RESULT_HIDDEN = 450;
const HEIGHT_RESULT_SHOWN = 300;

function TranslationResult({ showResult, translatedText, targetLang, onClose, onFeedback, translationId }) {
  if (!showResult) return null;

  return (
    <View style={{ marginTop: 20 }}>
      <ResultCard 
        translatedText={translatedText} 
        targetLang={targetLang} 
        onClose={onClose}
        pronounceIcon={pronounceIcon}
      />
      {/* Feedback Buttons */}
      <View style={styles.feedbackContainer}>
        <TouchableOpacity style={styles.feedbackBtn} onPress={() => onFeedback(1)}>
          <Ionicons name="thumbs-up-outline" size={24} color="#4CAF50" />
          <Text style={styles.feedbackText}>Correct</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedbackBtn} onPress={() => onFeedback(0)}>
          <Ionicons name="thumbs-down-outline" size={24} color="#F44336" />
          <Text style={styles.feedbackText}>Incorrect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TextToText() {
  const router = useRouter();
  const [sourceLang, setSourceLang] = useState('Tagalog');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [currentTranslationId, setCurrentTranslationId] = useState(null);

  const icons = useMemo(() => ({ camera: cameraIcon, mic: micIcon }), []);

  const animateTransition = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    console.log("🚀 Attempting to translate:", inputText); // This will show in terminal

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            Alert.alert("Authentication Required", "Please log in.");
            setIsLoading(false);
            return;
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}` 
            },
            body: JSON.stringify({ 
                sourceText: inputText, 
                sourceLang: sourceLang,
                targetLang: targetLang,
                source_language_id: 2,
                target_language_id: 3
            }),
        });

        console.log("📡 API Response Status:", response.status);

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ Full API Response:", result);

        const cleanText = result.translatedText
            .replace(/<end_of_turn>/g, '')
            .replace(/<start_of_turn>/g, '')
            .trim();

        setTranslatedText(cleanText || "No translation returned");
        setCurrentTranslationId(result.historyRecord?.id); 
        animateTransition();
        setShowResult(true);

    } catch (error) {
        console.error("❌ Translation Error:", error);
        Alert.alert("Engine Unavailable", "The translation server is currently unreachable.");
    } finally {
        Keyboard.dismiss();
        setIsLoading(false);
    }
};

  const handleFeedback = async (rating) => {
    if (!currentTranslationId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(FEEDBACK_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ 
          translationId: currentTranslationId, 
          rating 
        }),
      });

      if (response.ok) {
        Alert.alert("Thank you!", "Your feedback helps improve DialectoGo.");
      }
    } catch (error) {
      console.error("Feedback Error:", error);
    }
  };

  const handleExit = useCallback(() => {
    animateTransition();
    setInputText('');
    setShowResult(false);
    setCurrentTranslationId(null);
    Keyboard.dismiss();
  }, [animateTransition]);

  const handleToggleFocus = useCallback((focusState) => {
    animateTransition();
    setIsFocused(focusState);
  }, [animateTransition]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with History Link */}
      <View style={{marginTop: 10 , flexDirection: 'row', justifyContent: 'flex-center'}}>
        <TextShadow />
        <TouchableOpacity onPress={() => router.push('/History/History')}>
          <Ionicons name="time-outline" size={28} color="#333"/>
        </TouchableOpacity>
      </View>
      
      <LanguageSelector 
        sourceLang={sourceLang}
        targetLang={targetLang}
        translateIcon={translateIcon}
        onSwap={() => {
          setSourceLang(targetLang);
          setTargetLang(sourceLang);
        }}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled" 
        scrollEnabled={showResult}
      >
        <View style={{ height: showResult ? HEIGHT_RESULT_SHOWN : HEIGHT_RESULT_HIDDEN }}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: isFocused ? 0.59 : 1 }}
          >
            <TranslationInput 
              value={inputText}
              onChangeText={setInputText}
              onTranslate={handleTranslate}
              sourceLang={sourceLang}
              isFocused={isFocused}
              onFocus={() => handleToggleFocus(true)}
              onBlur={() => handleToggleFocus(false)}
              onExit={handleExit}
              icons={icons}
            />
          </KeyboardAvoidingView>
        </View>

        <TranslationResult 
          showResult={showResult}
          translatedText={translatedText}
          targetLang={targetLang}
          translationId={currentTranslationId}
          onFeedback={handleFeedback}
          onClose={() => {
            animateTransition();
            setShowResult(false);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginTop: 10
  },
  scrollContainer: { paddingBottom: 20 },
  resultWrapper: { marginTop: 20, paddingHorizontal: 20 },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 12
  },
  feedbackBtn: { alignItems: 'center' },
  feedbackText: { fontSize: 12, color: '#666', marginTop: 4 }
});