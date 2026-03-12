import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { Text, TextInput, IconButton, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import cameraIcon from '../../../assets/icons/cameraIcon.png';
import micIcon from '../../../assets/icons/micIcon.png';
import translateIcon from '../../../assets/icons/translateIcon.png';
import Result from './Result/Result';

const { height } = Dimensions.get('window');

export default function TextToText() {
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const [showResult, setShowResult] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const handleTranslate = () => {
    if (inputText.length > 0) {
      // Mock translation logic - replace with your actual NMT/AI call
      setTranslatedText("Unsay mahitabo!"); 
      setShowResult(true);
      Keyboard.dismiss();
    }
  };

  const handleExit = () => {
    setInputText('');
    Keyboard.dismiss();
    setIsFocused(false);
  };

  if (showResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultTopBar}>
          <IconButton icon="arrow-left" size={24} onPress={() => setShowResult(false)} />
          <Text style={styles.resultTitle}>Translation</Text>
        </View>
        <Result 
          sourceText={inputText} 
          translatedText={translatedText} 
          sourceLang={sourceLang} 
          targetLang={targetLang} 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.languageSelectorContainer}>
        <Surface style={styles.selectorSurface} elevation={1}>
          <TouchableOpacity style={styles.langButton}>
            <Text style={styles.langText}>{sourceLang}</Text>
            <MaterialCommunityIcons name="menu-down" size={24} color="#4b5563" />
          </TouchableOpacity>

          <IconButton 
            icon={translateIcon}
            size={24}
            iconColor="#1f2937"
            onPress={swapLanguages}
          />

          <TouchableOpacity style={styles.langButton}>
            <Text style={styles.langText}>{targetLang}</Text>
            <MaterialCommunityIcons name="menu-down" size={24} color="#4b5563" />
          </TouchableOpacity>
        </Surface>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} 
      >
        <Surface 
          style={[
            styles.translationCard, 
            { 
              flex: isFocused ? 0.90 : 1, 
              marginBottom: isFocused ? 5 : 15 
            }
          ]} 
          elevation={0}
        >
          <View style={styles.headerRow}>
            <Text variant="labelLarge" style={styles.label}>{sourceLang}</Text>
            
            {(isFocused || inputText.length > 0) && (
              <IconButton 
                icon="close" 
                size={20} 
                onPress={handleExit}
                style={styles.exitButton}
              />
            )}
          </View>

          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={isFocused}
          >
            <TextInput
              placeholder="Enter your text"
              multiline
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              style={[
                styles.textArea, 
                { 
                  fontSize: isFocused ? 24 : 36,
                 } 
              ]}
              placeholderTextColor="#9ca3af"
            />
            
            {!isFocused && inputText.length === 0 && (
              <View style={styles.chipContainer}>
                {['Hi there', 'Good morning', 'How\'s it going'].map((item, index) => (
                  <TouchableOpacity key={index} style={styles.chip} onPress={() => setInputText(item)}>
                    <Text style={styles.chipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
          <View style={styles.footerActions}>
            <IconButton 
              icon = {cameraIcon}
              size={28}
              iconColor="#374151"
              onPress={() => console.log('Image Picker Pressed')}
              style={styles.leftAction}
            />
            <View style={styles.rightAction}>
              {inputText.length > 0 ? (
                <Button 
                  mode="contained" 
                  buttonColor="#FBBF24" 
                  textColor="#1f2937"
                  onPress={handleTranslate}
                  style={styles.translateBtn}
                >
                  Translate
                </Button>
              ) : (
                <IconButton 
                  icon={micIcon} 
                  size={32}
                  iconColor="#374151"
                  onPress={() => {}}
                  style={styles.micButton}
                />
              )}
            </View>
            </View>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  languageSelectorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  selectorSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D9D9D9',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 65,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  langText: {
    fontSize: 18,
    color: '#1f2937',
  },
  translationCard: {
    backgroundColor: '#D9D9D9', 
    marginHorizontal: 15,
    borderRadius: 30,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    color: '#4b5563',
  },
  exitButton: {
    margin: 0,
    backgroundColor: '#9ca3af',
    borderRadius: 12,
  },
  textArea: {
    backgroundColor: 'transparent',
    fontWeight: '700',
    paddingHorizontal: 0,
    textAlignVertical: 'top',
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  chip: {
    backgroundColor: '#FDE68A', 
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 15,
    marginBottom: 10,
  },
  chipText: {
    fontSize: 16,
    color: '#1f2937',
  },
  footerActions: {
    height: 60,
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  translateBtn: {
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  micButton: {
    margin: 0,
  }
});