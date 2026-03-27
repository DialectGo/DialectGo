import React, { useState, useCallback, useMemo } from 'react';
import { View, Keyboard, KeyboardAvoidingView, Platform, LayoutAnimation, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextShadow from '../../../shared/components/TextShadow';
import LanguageSelector from '../../../shared/components/LanguageSelector';
import TranslationInput from '../../../shared/components/TranslationInput';
import ResultCard from '../../../shared/components/ResultCard';
import cameraIcon from '../../../assets/icons/cameraIcon.png';
import micIcon from '../../../assets/icons/micIcon.png';
import translateIcon from '../../../assets/icons/translateIcon.png';
import pronounceIcon from '../../../assets/icons/pronounceIcon.png';

const API_URL = 'http://192.168.1.43:5001/api/translate';
const HEIGHT_RESULT_HIDDEN = 450;
const HEIGHT_RESULT_SHOWN = 300;

export default function TextToText() {
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  const icons = useMemo(() => ({ camera: cameraIcon, mic: micIcon }), []);
  const inputContainerHeight = showResult ? HEIGHT_RESULT_SHOWN : HEIGHT_RESULT_HIDDEN;

  const animateTransition = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceText: inputText, sourceLang, targetLang }),
      });

      const result = await response.json();

      if (response.ok) {
        setTranslatedText(result.translatedText);
        animateTransition();
        setShowResult(true);
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your server connection.");
    } finally {
      Keyboard.dismiss();
    }
  };

  const handleExit = useCallback(() => {
    animateTransition();
    setInputText('');
    setShowResult(false);
    Keyboard.dismiss();
  }, [animateTransition]);

  const handleToggleFocus = useCallback((focusState) => {
    animateTransition();
    setIsFocused(focusState);
  }, [animateTransition]);

  return (
    <SafeAreaView style={styles.container}>
      <TextShadow />
      
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
        <View style={{ height: inputContainerHeight }}>
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

        {showResult && (
          <View style={styles.resultWrapper}>
            <ResultCard 
              translatedText={translatedText} 
              targetLang={targetLang} 
              onClose={() => {
                 animateTransition();
                 setShowResult(false);
              }}
              pronounceIcon={pronounceIcon}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  scrollContainer: { 
    paddingBottom: 20 
  },
  resultWrapper: { 
    marginTop: 20 
  }
});