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
  View
} from 'react-native';

import BottomNav from '../../../shared/components/BottomNav';
import TopBar from '../../../shared/components/TopBar';
import { styles } from '../../../shared/styles/TranslateStyles';

export default function TranslateScreen({ activeTab, onNavigate }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [selectingFor, setSelectingFor] = useState('source');
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const languages = ['English', 'Tagalog', 'Cebuano'];

  // --- 1. MOCK TRANSLATE FUNCTION (Frontend Only) ---
  const handleTranslate = (text) => {
    if (!text.trim()) {
      setTranslation('');
      return;
    }

    setIsLoading(true);

    // Mock delay para kunwari ay nag-iisip ang AI (1 second)
    setTimeout(() => {
      // Dito mo muna ilalagay ang static response para sa demo/testing
      const mockResult = `[Static Translation] ${text}`; 
      setTranslation(mockResult);
      setIsLoading(false);
    }, 1000);
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
              <TouchableOpacity onPress={() => console.log("OCR Pressed")}>
                <Image source={require('../../../assets/icons/cameraIcon.png')} style={styles.footerIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => console.log("Mic Pressed")}>
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
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = selectingFor === 'source' ? item === sourceLang : item === targetLang;
                return (
                  <TouchableOpacity
                    style={[styles.dropdownItem, isSelected && { backgroundColor: '#FFFDE7' }]}
                    onPress={() => selectLanguage(item)}
                  >
                    <Text style={[styles.dropdownItemText, isSelected && { color: '#FBC02D', fontWeight: 'bold' }]}>
                      {item}
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