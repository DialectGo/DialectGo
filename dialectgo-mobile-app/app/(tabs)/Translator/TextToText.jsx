import React, { useState } from 'react';
import { Text, View, Keyboard, KeyboardAvoidingView, Platform, LayoutAnimation, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextShadow from '../../../shared/components/TextShadow';
import LanguageSelector from '../../../shared/components/LanguageSelector';
import TranslationInput from '../../../shared/components/TranslationInput';
// import Result from './Result/Result'; 
import ResultCard from '../../../shared/components/ResultCard';
import cameraIcon from '../../../assets/icons/cameraIcon.png';
import micIcon from '../../../assets/icons/micIcon.png';
import translateIcon from '../../../assets/icons/translateIcon.png';
import pronounceIcon from '../../../assets/icons/pronounceIcon.png';

export default function TextToText() {
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  const handleTranslate = async () => {
    if (inputText.length === 0) return;
    try {
      const response = await fetch('http://192.168.1.43:5001/api/translate', { //replace with your server's local IP and port
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceText: inputText, sourceLang, targetLang }),
      });
      const result = await response.json();
      if (response.ok) {
        setTranslatedText(result.translatedText);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
        setShowResult(true);
      }
    } catch (error) {
      alert("Network error.");
    } finally {
      Keyboard.dismiss();
    }
  };
  const handleExit = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInputText('');
    setShowResult(false);
    Keyboard.dismiss();
  };

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

      
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled" scrollEnabled={showResult}>
        <View style={{ height: showResult ? 300 : 450 }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: isFocused ? 0.59 : 1 }}>
            <TranslationInput 
              value={inputText}
              onChangeText={setInputText}
              onTranslate={handleTranslate}
              sourceLang={sourceLang}
              isFocused={isFocused}
              onFocus={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setIsFocused(true);}}
              onBlur={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setIsFocused(false);}}
              onExit={handleExit}
              icons={{ camera: cameraIcon, mic: micIcon }}
            />
          </KeyboardAvoidingView>
        </View>
        {showResult && (
            <View style={{ marginTop: 20 }}>
              <ResultCard 
                translatedText={translatedText} 
                targetLang={targetLang} 
                onClose={() => {
                   LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  translateText: {
    fontSize: 28,
    fontWeight: '900', 
    color: '#1f2937', 
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    
  },
});