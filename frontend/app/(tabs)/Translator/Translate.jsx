import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../../../shared/components/BottomNav';
import TopBar from '../../../shared/components/TopBar';
import { styles } from '../../../shared/styles/TranslateStyles';

const { width } = Dimensions.get('window');

export default function TranslateScreen({ activeTab, onNavigate }) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [selectingFor, setSelectingFor] = useState('source');
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(false); 
  const [feedback, setFeedback] = useState(null); 
  const [suggestionText, setSuggestionText] = useState('');

  const languages = ['English', 'Tagalog', 'Cebuano'];

  const handleTranslate = (text) => {
    if (!text.trim()) {
      setTranslation('');
      setError(false);
      return;
    }

    setIsLoading(true);
    setFeedback(null); 
    setError(false);

    setTimeout(() => {
      if (text.toLowerCase() === 'error') {
        setError(true);
        setTranslation('');
      } else {
        setTranslation(`Salin: ${text}`); 
      }
      setIsLoading(false);
    }, 1000);
  };

  const submitSuggestion = () => {
    Alert.alert("Salamat!", "Nai-save na ang iyong suggestion para sa DialectGo.");
    setSuggestionText('');
    setFeedback(null);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputText) handleTranslate(inputText);
    }, 1000); 

    return () => clearTimeout(delayDebounceFn);
  }, [inputText, targetLang, sourceLang]);

  const openPicker = (type) => {
    setSelectingFor(type);
    setModalVisible(true);
  };

  const selectLanguage = (lang) => {
    if (selectingFor === 'source') {
      if (lang === targetLang) setTargetLang(sourceLang);
      setSourceLang(lang);
    } else {
      if (lang === sourceLang) setSourceLang(targetLang);
      setTargetLang(lang);
    }
    setModalVisible(false);
  };

  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <TopBar onMenuPress={() => console.log("Menu Pressed!")} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.content}>

          {/* 1. UPDATED HEADER: "Translate Now!" Alignment */}
          <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>
                Translate <Text style={styles.yellowText}>Now!</Text>
              </Text>
              <Text style={styles.subHeader}>TEXT MODE</Text>
          </View>

          {/* 2. UPDATED SELECTOR: Yellow pill-style bar */}
          <View style={styles.newSelectorBar}>
            <TouchableOpacity style={styles.langPill} onPress={() => openPicker('source')}>
              <Text style={styles.langPillText}>{sourceLang}</Text>
              <Ionicons name="caret-down" size={12} color="#1F2937" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.newSwapButton} onPress={swapLanguages}>
              <Ionicons name="swap-horizontal" size={20} color="#1F2937" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.langPill} onPress={() => openPicker('target')}>
              <Text style={styles.langPillText}>{targetLang}</Text>
              <Ionicons name="caret-down" size={12} color="#1F2937" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

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
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
            
            <View style={styles.cardFooter}>
              <View style={styles.shortcutIcons}>
                <TouchableOpacity 
                  onPress={() => router.push('/Translator/ImageToText')} 
                  style={styles.iconBtn}
                >
                  <Ionicons name="camera" size={22} color="#1F2937" />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => router.push('/Translator/SpeechToText')} 
                  style={styles.iconBtn}
                >
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
                <Ionicons name="volume-high" size={20} color="#FBBF24" />
              </View>

              {isLoading ? (
                <View style={styles.loadingArea}>
                  <ActivityIndicator size="small" color="#FBBF24" />
                </View>
              ) : (
                <Text style={styles.resultText}>{translation}</Text>
              )}
              
              <View style={styles.cardFooter}>
                <View />
                <TouchableOpacity style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={16} color="#FBBF24" />
                  <Text style={styles.copyBtnText}>COPY</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* FEEDBACK SECTION */}
          {inputText.length > 0 && !isLoading && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackAsk}>
                {error ? "Translation failed. Try again?" : "Is this translation correct?"}
              </Text>
              
              {!error && (
                <View style={styles.feedbackIcons}>
                  <TouchableOpacity 
                    onPress={() => setFeedback('like')} 
                    style={[styles.miniFeedbackBtn, feedback === 'like' && styles.activeYellow]}
                  >
                    <Ionicons name="thumbs-up" size={18} color={feedback === 'like' ? "#1F2937" : "#9CA3AF"} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => setFeedback('unlike')} 
                    style={[styles.miniFeedbackBtn, feedback === 'unlike' && styles.activeYellow]}
                  >
                    <Ionicons name="thumbs-down" size={18} color={feedback === 'unlike' ? "#1F2937" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              )}

              {(feedback === 'unlike' || error) && (
                <View style={styles.suggestionBox}>
                  <TextInput 
                    style={styles.suggestionInput}
                    placeholder="Help us improve DialectGo..."
                    value={suggestionText}
                    onChangeText={setSuggestionText}
                    multiline
                  />
                  <TouchableOpacity style={styles.yellowSubmitBtn} onPress={submitSuggestion}>
                    <Text style={styles.submitText}>SUBMIT</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL PICKER - Modern Bottom Sheet style */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Language</Text>
            {languages.map((item) => (
               <TouchableOpacity key={item} style={styles.sheetItem} onPress={() => selectLanguage(item)}>
                 <Text style={[styles.sheetItemText, (selectingFor === 'source' ? sourceLang : targetLang) === item && styles.activeSheetText]}>{item}</Text>
                 {(selectingFor === 'source' ? sourceLang : targetLang) === item && (
                   <Ionicons name="checkmark-circle" size={22} color="#FBBF24" />
                 )}
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