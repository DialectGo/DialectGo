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
import LanguageSelector from '../../../shared/components/LanguageSelector'; // Imported selector
import { styles } from '../../../shared/styles/TranslateStyles';
import { supabase } from '../../../shared/lib/supabase';

// Assets
import translateIcon from '../../../assets/icons/translateIcon.png';

const { width } = Dimensions.get('window');

// API Endpoints
const API_URL = 'http://192.168.1.53:5001/api/translate';
const FEEDBACK_URL = 'http://192.168.1.53:5001/api/feedback';

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

  // Backend Language Mapping
  const languages = [
    { name: 'English', id: 1 },
    { name: 'Tagalog', id: 2 },
    { name: 'Cebuano', id: 3 },
  ];

  // --- BACKEND INTEGRATION: TRANSLATE FUNCTION ---
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
          sourceText: text,
          sourceLang: sourceLang, 
          targetLang: targetLang,
          source_language_id: languages.find(l => l.name === sourceLang)?.id, 
          target_language_id: languages.find(l => l.name === targetLang)?.id,
        }),
      });

      const data = await response.json();

      const cleanAIOutput = (text) => {
        if (!text) return "";
        return text
          .replace(/model/gi, '')
          .replace(/user/gi, '') 
          .replace(/Translation:/gi, '')
          .trim();
      };

      if (response.ok) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const cleaned = cleanAIOutput(data.translatedText);
        setTranslation(cleaned);
      } else {
        setError(true);
        setTranslation("Error: Could not translate.");
      }
    } catch (err) {
      setError(true);
      setTranslation("Error: Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- BACKEND INTEGRATION: FEEDBACK FUNCTION ---
  const submitSuggestion = async () => {
    if (!suggestionText.trim() && feedback !== 'unlike') return;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(FEEDBACK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                original_text: inputText,
                translated_text: translation,
                suggested_text: suggestionText,
                rating: feedback === 'like' ? 5 : 1
            })
        });

        if (response.ok) {
            Alert.alert("Salamat!", "Nai-save na ang iyong suggestion para sa DialectGo.");
            setSuggestionText('');
            setFeedback(null);
        }
    } catch (err) {
        Alert.alert("Error", "Could not send feedback.");
    }
  };

  // Debounce Effect
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

  const selectLanguage = (langObj) => {
    if (selectingFor === 'source') {
      if (langObj.name === targetLang) setTargetLang(sourceLang);
      setSourceLang(langObj.name);
    } else {
      if (langObj.name === sourceLang) setSourceLang(targetLang);
      setTargetLang(langObj.name);
    }
    setModalVisible(false);
  };

  const swapLanguages = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Swap Languages
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);

    // Logic: Swap text as well if a translation exists
    if (translation && !error) {
        const tempText = inputText;
        setInputText(translation);
        setTranslation(tempText);
    }
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

          {/* HEADER */}
          <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>
                Translate <Text style={styles.yellowText}>Now!</Text>
              </Text>
              <Text style={styles.subHeader}>TEXT MODE</Text>
          </View>

          {/* INTEGRATED LANGUAGE SELECTOR */}
          <LanguageSelector 
            sourceLang={sourceLang} 
            targetLang={targetLang}
            onSwap={swapLanguages} 
            onSelectSource={() => openPicker('source')}
            onSelectTarget={() => openPicker('target')}
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
              multiline
              value={inputText}
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
                <Ionicons name="volume-high" size={20} color="#FBBF24" />
              </View>

              {isLoading ? (
                <View style={styles.loadingArea}>
                  <ActivityIndicator size="small" color="#FBBF24" />
                  <Text style={{ marginTop: 8, color: '#9CA3AF', fontSize: 12 }}>DialectGo is thinking...</Text>
                </View>
              ) : (
                <Text style={styles.resultText}>{translation || "Waiting for translation..."}</Text>
              )}
              
              <View style={styles.cardFooter}>
                <View />
                <TouchableOpacity style={styles.copyBtn} onPress={() => Alert.alert("Copied", "Text copied to clipboard")}>
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

      {/* MODAL PICKER */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Language</Text>
            {languages.map((item) => (
               <TouchableOpacity key={item.id} style={styles.sheetItem} onPress={() => selectLanguage(item)}>
                 <Text style={[
                   styles.sheetItemText, 
                   (selectingFor === 'source' ? sourceLang : targetLang) === item.name && styles.activeSheetText
                 ]}>
                   {item.name}
                 </Text>
                 {(selectingFor === 'source' ? sourceLang : targetLang) === item.name && (
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