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
  LayoutAnimation,
  View,
  Keyboard,
  Alert
} from 'react-native';

import BottomNav from '../../../shared/components/BottomNav';
import TopBar from '../../../shared/components/TopBar';
import { styles } from '../../../shared/styles/TranslateStyles';
import { supabase } from '../../../shared/lib/supabase';
import { useRouter } from 'expo-router';

const API_URL = 'http://192.168.0.104:5001/api/translate';
const FEEDBACK_URL = 'http://192.168.0.104:5001/api/feedback';

export default function TranslateScreen({ activeTab, onNavigate }) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [selectingFor, setSelectingFor] = useState('source');
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [currentTranslationId, setCurrentTranslationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const animateTransition = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };
  const [showResult, setShowResult] = useState(false);

  const languages = [
  { name: 'english', id: 1 },
  { name: 'tagalog', id: 2 },
  { name: 'cebuano', id: 3 },
];

  // --- 1. MOCK TRANSLATE FUNCTION (Frontend Only) ---
const handleTranslate = async (text) => {
  if (!text.trim()) {
    setTranslation('');
    return;
  }

  setIsLoading(true);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        Alert.alert("Authentication Required", "Please log in.");
        return;
        }
    const response = await fetch('http://192.168.0.104:5001/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 2. Use the fresh token
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        sourceText: text,
        // Try changing these keys to match your backend exactly
        // If the backend says "sourceLang is not defined", it might actually
        // be looking for "source_lang" or "sourceLanguage".
        sourceLang: sourceLang, 
        targetLang: targetLang,
        source_language_id: languages.find(l => l.name === sourceLang)?.id, 
        target_language_id: languages.find(l => l.name === targetLang)?.id,
      }),
    });

    const data = await response.json();

    const cleanAIOutput = (text) => {
        return text
            .replace(/model/gi, '') // Removes the word "model"
            .replace(/user/gi, '')  // Removes the word "user"
            .replace(/Translation:/gi, '')
            .trim();
    };

    if (response.ok) {
      const cleaned = cleanAIOutput(data.translatedText);
      setTranslation(cleaned); // Assuming API returns { translatedText: "..." }
    } else {
      console.error("Translation error:", data);
      setTranslation("Error: Could not translate.");
    }
  } catch (error) {
    console.error("Network error:", error);
    setTranslation("Error: Check your connection.");
  } finally {
    setIsLoading(false);
  }
};

  // --- 2. DEBOUNCE EFFECT (Mananatili ito para sa UI feel) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputText) handleTranslate(inputText);
    }, 1000); 

    return () => clearTimeout(delayDebounceFn);
  }, [inputText, targetLang, sourceLang]);

  // --- 3. LANGUAGE PICKER LOGIC ---
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
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar onMenuPress={() => console.log("Menu Pressed!")} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.content}>

          {/* HEADER SECTION */}
          <View style={styles.headerRow}>
            <View style={styles.textContainer}>
              <Text style={styles.headerTitle}>
                Translate <Text style={styles.yellowText}>Now!</Text>
              </Text>
              <View style={styles.titleUnderline} />
            </View>
          </View>

          {/* LANGUAGE SELECTOR BAR */}
          <View style={styles.selectorBar}>
            <TouchableOpacity style={styles.langButton} onPress={() => openPicker('source')}>
              <Text style={styles.langText}>{sourceLang}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={swapLanguages}>
              <Image source={require('../../../assets/icons/translateIcon.png')} style={styles.swapIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.langButton} onPress={() => openPicker('target')}>
              <Text style={styles.langText}>{targetLang}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* INPUT CARD */}
          <View style={[
            styles.translateCard,
            { minHeight: inputText.length > 0 ? 220 : 400 }
          ]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>{sourceLang}</Text>
              <TextInput
                style={styles.mainInput}
                placeholder="Enter your text"
                placeholderTextColor="#BDBDBD"
                multiline
                value={inputText}
                onChangeText={(text) => setInputText(text)}
              />

              {!inputText && (
                <View style={styles.suggestionInsideCard}>
                  {['Kumusta?', 'Maayong buntag'].map((txt, i) => (
                    <TouchableOpacity key={i} style={styles.chip} onPress={() => setInputText(txt)}>
                      <Text style={styles.chipText}>{txt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity onPress={() => router.push('/Translator/LiveCamera')}>
                <Image source={require('../../../assets/icons/cameraIcon.png')} style={styles.footerIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/Translator/SpeechToText')}>
                <Image source={require('../../../assets/icons/micIcon.png')} style={styles.footerIcon} />
              </TouchableOpacity>
            </View>
          </View> 

          {/* RESULT CARD */}
          {inputText.length > 0 && (
            <View style={[styles.translateCard, { marginTop: 15, minHeight: 200 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>{targetLang}</Text>
                {isLoading ? (
                  <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#FBC02D" />
                    <Text style={{ marginTop: 5, color: '#8E8E8E', fontSize: 12 }}>DialectGo is thinking...</Text>
                  </View>
                ) : (
                  <Text style={styles.resultText}>{translation || "Waiting for translation..."}</Text>
                )}
              </View>

              <View style={styles.cardFooter}>
                <View />
                <TouchableOpacity onPress={() => console.log("Copy Pressed")}>
                  <Text style={{ color: '#8E8E8E', fontSize: 12 }}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* DROPDOWN MODAL */}
      <Modal 
        visible={modalVisible} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = selectingFor === 'source' ? item.name === sourceLang : item.name === targetLang;
                return (
                  <TouchableOpacity
                    style={[styles.dropdownItem, isSelected && { backgroundColor: '#FFFDE7' }]}
                    onPress={() => selectLanguage(item)} // Pass the whole object
                  >
                    <Text style={[styles.dropdownItemText, isSelected && { color: '#FBC02D', fontWeight: 'bold' }]}>
                      {item.name}
                    </Text>
                    {isSelected && <Text style={{ color: '#FBC02D' }}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNav activeTab={activeTab} setActiveTab={onNavigate} />
    </SafeAreaView>
  );
}