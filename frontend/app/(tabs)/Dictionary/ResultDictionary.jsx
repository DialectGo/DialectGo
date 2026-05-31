import React, { useState, useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { supabase } from '../../../shared/lib/supabase';
import BottomNav from '../../../shared/components/BottomNav';
import { styles } from '../../../shared/styles/ResultDictionaryStyles';
import FeatureGateModal from '../../../shared/components/FeatureGateModal';

const SAVE_API_URL = 'http://192.168.1.53:5001/api/dictionary/save';

export default function ResultDictionary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  
  // NetInfo network state
  const [isConnected, setIsConnected] = useState(true);
  const canUseOnlineFeatures = isConnected && !isGuestMode;

  // Listen for network changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      if (!connected) {
        setIsGuestMode(true);
      } else {
        checkGuestMode();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    checkGuestMode();
  }, []);

  const checkGuestMode = async () => {
    try {
      const localGuestMode = await AsyncStorage.getItem('@guest_mode');
      const { data: { session } } = await supabase.auth.getSession();
      const role = await AsyncStorage.getItem('@user_role');

      const isGuest = !session || role === 'guest' || localGuestMode !== null;
      setIsGuestMode(isGuest);
    } catch (error) {
      setIsGuestMode(true);
    }
  };

  // Destructure parameters
  const { 
  id, wordTerm, partOfSpeech, definition, languageId,
  exampleUsage, phoneticTranscription, 
  translation1, translation2, 
  usage1, usage2, translationDef1, translationDef2
} = params;

// 2. Parse languageId to an integer safely
const currentLangId = parseInt(languageId, 10);

// 3. Directly assign terms based on the explicit source language
let cebuanoTerm = '';
let cebuanoDef = '';
let tagalogTerm = '';
let tagalogDef = '';

if (currentLangId === 3) {
  // The searched word is explicitly CEBUANO
  cebuanoTerm = wordTerm;
  cebuanoDef = definition || 'Walay kahulugan.';
  
  // Translations must be Tagalog (Translation 1)
  tagalogTerm = translation1 || '---';
  tagalogDef = translationDef1 || 'Walang kahulugan.';
} else {
  // The searched word is explicitly TAGALOG (or fallback)
  tagalogTerm = wordTerm;
  tagalogDef = definition || 'Walang kahulugan.';
  
  // Translations must be Cebuano (Translation 2)
  cebuanoTerm = translation2 || '---';
  cebuanoDef = translationDef2 || 'Walay kahulugan.';
}
  // Helper function to detect word_term language and match definitions
  const getLanguageHighlights = () => {
    const cleanWord = (wordTerm || '').trim().toLowerCase();
    
    // Tagalog common anchor markers
    const isTagalog = /\b(ang|mga|sa|ng|si|ni|kay|na|iyong|ito)\b/i.test(exampleUsage || '') || 
                      /\b(sa|ng|mga)\b/i.test(cleanWord);
    
    // Cebuano common anchor markers                  
    const isCebuano = /\b(kaning|kani|kiri|bisan|lumad|maayong|gwapo|kaayo|niini)\b/i.test(exampleUsage || '') ||
                      /\b(og|kaning|kaayo)\b/i.test(cleanWord);

    // If both tests fail, we evaluate via structural placement default configs
    if (isCebuano) return 'cebuano';
    if (isTagalog) return 'tagalog';
    return 'english'; // Fallback highlight
  };

  const activeLanguage = getLanguageHighlights();

  const handleSaveWord = async () => {
    if (!id) {
      Alert.alert("Error", "ID is missing.");
      return;
    }
    if (!isConnected) {
      Alert.alert("Network Offline", "You need an internet connection to save words.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert("Error", "Please login to save words.");
        return;
      }
      
      const response = await fetch(SAVE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ dictionary_id: parseInt(id) }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setIsBookmarked(true);
        Alert.alert("Success", `"${wordTerm}" saved.`);
      } else {
        throw new Error(result.message || "Failed to save.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Highlight style generator function
  const getDefinitionRowStyle = (langKey) => {
    const isMatched = activeLanguage === langKey;
    return {
      backgroundColor: isMatched ? '#FFFDE7' : '#FFFFFF',
      padding: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isMatched ? '#FFD54F' : '#EFEBE9',
      marginBottom: 10,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {!isConnected && (
        <View style={{ backgroundColor: '#D32F2F', padding: 5, alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>
            OFFLINE MODE: ONLINE ACTIONS ARE TEMPORARILY DISABLED
          </Text>
        </View>
      )}

      {/* HEADER SECTION */}
      <View style={[styles.topHeader, { 
        flexDirection: 'row', 
        justifyContent: 'flex-start',
        alignItems: 'center', 
        paddingHorizontal: 20,
        gap: 15
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnNoBg}>
          <Image source={require('../../../assets/icons/back_arrow.png')} style={styles.backImgLarge} />
        </TouchableOpacity>
        
        <View style={{ alignItems: 'flex-start' }}>
          <Text style={styles.brandYellow}>DialectGo</Text>
          <Text style={styles.brandBlack}>Dictionary</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        {/* HERO CARD */}
        <View style={styles.mainWordCard}>
          <Text style={styles.heroWord}>{wordTerm}</Text>
          
          {phoneticTranscription ? (
            <Text style={styles.heroPronounce}>//{phoneticTranscription}//</Text>
          ) : null}

          {/* ✅ ADDED: PART OF SPEECH CAPSULE */}
          {partOfSpeech ? (
            <View style={{
              backgroundColor: '#FFD54F',
              paddingHorizontal: 14,
              paddingVertical: 4,
              borderRadius: 20,
              alignSelf: 'center',
              marginTop: 8,
              borderWidth: 1,
              borderColor: '#FFC107',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 1,
              elevation: 1
            }}>
              <Text style={{ 
                fontSize: 12, 
                fontWeight: '800', 
                color: '#421C00', 
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                {partOfSpeech}
              </Text>
            </View>
          ) : null}
        </View>

        {/* --- UNIFIED VERTICAL DEFINITIONS LIST --- */}
        <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#421C00', marginBottom: 12 }}>
            Definitions & Meanings:
          </Text>

          {/* CEBUANO CARD */}
          <View style={{
            backgroundColor: currentLangId === 3 ? '#FFFDE7' : '#FFFFFF',
            padding: 14,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: currentLangId === 3 ? '#FFD54F' : '#EFEBE9',
            marginBottom: 10,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#795548', textTransform: 'uppercase', marginBottom: 2 }}>
              Cebuano Meaning {currentLangId === 3 ? '• (Current Term Language)' : ''}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#421C00' }}>
              {cebuanoTerm}
            </Text>
            <Text style={{ fontSize: 13, color: '#5D4037', marginTop: 4, fontStyle: 'italic' }}>
              {cebuanoDef}
            </Text>
          </View>

          {/* TAGALOG CARD */}
          <View style={{
            backgroundColor: currentLangId !== 3 ? '#FFFDE7' : '#FFFFFF',
            padding: 14,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: currentLangId !== 3 ? '#FFD54F' : '#EFEBE9',
            marginBottom: 10,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#795548', textTransform: 'uppercase', marginBottom: 2 }}>
              Tagalog Meaning {currentLangId !== 3 ? '• (Current Term Language)' : ''}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#421C00' }}>
              {tagalogTerm}
            </Text>
            <Text style={{ fontSize: 13, color: '#5D4037', marginTop: 4 }}>
              {tagalogDef}
            </Text>
          </View>

          {/* ENGLISH CARD */}
          <View style={{
            backgroundColor: '#FFFFFF',
            padding: 14,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#EFEBE9',
            marginBottom: 10,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#795548', textTransform: 'uppercase', marginBottom: 2 }}>
              English Meaning
            </Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#421C00' }}>
              {wordTerm} (English Context)
            </Text>
            <Text style={{ fontSize: 13, color: '#5D4037', marginTop: 4 }}>
              {currentLangId === 3 ? translationDef1 || 'No English translation available.' : translationDef2 || 'No English translation available.'}
            </Text>
          </View>
        </View>

        {/* USAGE EXAMPLES SECTION */}
        <View style={[styles.exampleSection, { marginTop: 25 }]}>
          <Text style={[styles.exampleTitle, { fontSize: 18, fontWeight: 'bold', color: '#421C00' }]}>Usage Examples:</Text>
          <View style={styles.exampleContent}>
            <View style={{ marginBottom: 12 }}>
                <Text style={[styles.boldLabel, { marginBottom: 2 }]}>{wordTerm}:</Text>
                <Text style={styles.exampleLine}>{exampleUsage || 'No example available.'}</Text>
            </View>
            {translation1 ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.boldLabel, { marginBottom: 2 }]}>{translation1}:</Text>
                <Text style={styles.exampleLine}>{usage1 || 'No example available.'}</Text>
              </View>
            ) : null}
            {translation2 ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.boldLabel, { marginBottom: 2 }]}>{translation2}:</Text>
                <Text style={styles.exampleLine}>{usage2 || 'No example available.'}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* SAVE BUTTON */}
      <View style={{ paddingBottom: 20, alignItems: 'center' }}>
          <TouchableOpacity 
            style={[
              styles.floatingSaveBtn, 
              isBookmarked && styles.activeSaveBtn,
              (!isConnected && !isBookmarked) && { backgroundColor: '#A0A0A0' } 
            ]} 
            onPress={() => {
              if (!canUseOnlineFeatures) {
                setShowFeatureModal(true);
                return;
              }
              handleSaveWord();
            }}
            disabled={isSaving || isBookmarked}
          >
            {isSaving ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <>
                    <Image source={require('../../../assets/icons/star.png')} style={[styles.starIcon, { tintColor: '#FFFFFF' }]} />
                    <Text style={styles.bookmarkText}>
                        {isBookmarked ? 'SAVED' : 'SAVE WORD'}
                    </Text>
                </>
            )}
          </TouchableOpacity>
      </View>

      <FeatureGateModal visible={showFeatureModal} onClose={() => setShowFeatureModal(false)} />
      <BottomNav activeTab="Dictionary" />
    </SafeAreaView>
  );
}