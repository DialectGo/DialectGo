import React, { useState, useEffect, useCallback } from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { supabase } from '../../../shared/lib/supabase';
import BottomNav from '../../../shared/components/BottomNav';
import RefreshContainer from '../../../shared/components/RefreshContainer'; // ✅ IMPORT REUSABLE REFRESH CONTAINER
import { styles } from '../../../shared/styles/ResultDictionaryStyles';
import FeatureGateModal from '../../../shared/components/FeatureGateModal';
import { endpoints } from '../../../shared/config/apiConfig';

const SAVE_API_URL = endpoints.DICTIONARY_SAVE;
const CHECK_SAVED_API_URL = endpoints.DICTIONARY_CHECK_SAVED;


export default function ResultDictionary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    id, wordTerm, partOfSpeech, definition, languageId,
    exampleUsage, phoneticTranscription, 
    translation1, translation2, 
    usage1, usage2, translationDef1, translationDef2
  } = params;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // ✅ STATE FOR PULL-TO-REFRESH

  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  
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

  // Extraction handler to verify initial bookmark state
  const verifyBookmarkStatus = async () => {
    if (!id || isGuestMode || !isConnected) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${CHECK_SAVED_API_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setIsBookmarked(result.isBookmarked); 
      }
    } catch (error) {
      console.error("Failed to fetch initial word bookmark state:", error);
    }
  };

  // Verify bookmark status on mount
  useEffect(() => {
    verifyBookmarkStatus();
  }, [id, isGuestMode, isConnected]);

  // ✅ PULL-TO-REFRESH LIFECYCLE HANDLER
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkGuestMode();
    await verifyBookmarkStatus(); // Re-checks database if word state has been saved/altered
    setRefreshing(false);
  }, [id, isGuestMode, isConnected]);

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

  const currentLangId = parseInt(languageId, 10);

  let cebuanoTerm = '';
  let cebuanoDef = '';
  let tagalogTerm = '';
  let tagalogDef = '';

  if (currentLangId === 3) {
    cebuanoTerm = wordTerm;
    cebuanoDef = definition || 'Walay kahulugan.';
    tagalogTerm = translation1 || '---';
    tagalogDef = translationDef1 || 'Walang kahulugan.';
  } else {
    tagalogTerm = wordTerm;
    tagalogDef = definition || 'Walang kahulugan.';
    cebuanoTerm = translation2 || '---';
    cebuanoDef = translationDef2 || 'Walay kahulugan.';
  }

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

      {/* ✅ REPLACED SCROLLVIEW WITH REFRESHCONTAINER */}
      <RefreshContainer 
        refreshing={refreshing} 
        onRefresh={handleRefresh} 
        contentContainerStyle={styles.scrollPadding}
      >
        {/* HERO CARD */}
        <View style={styles.mainWordCard}>
          <Text style={styles.heroWord}>{wordTerm}</Text>
          
          {phoneticTranscription ? (
            <Text style={styles.heroPronounce}>//{phoneticTranscription}//</Text>
          ) : null}

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

        {/* DEFINITIONS LIST */}
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
      </RefreshContainer>

      {/* SAVE BUTTON CONTAINER */}
      <View style={{ paddingBottom: 20, alignItems: 'center', backgroundColor: '#FFFFFF' }}>
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