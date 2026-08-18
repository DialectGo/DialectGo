import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { supabase } from '../../../src/shared/api/supabase';
import RefreshContainer from '../../../src/shared/components/RefreshContainer';
import ProfileTopBar from '../../../src/components/ProfileTopBar';
import { styles } from '../../../src/features/dictionary/styles/ResultDictionaryStyles';
import FeatureGateModal from '../../../src/shared/components/FeatureGateModal';
import { endpoints } from '../../../src/shared/api/client';

const SAVE_API_URL = endpoints.DICTIONARY_SAVE;
const CHECK_SAVED_API_URL = endpoints.DICTIONARY_CHECK_SAVED;

export default function ResultDictionary() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    id,
    wordTerm,
    partOfSpeech,
    definition,
    languageId,
    exampleUsage,
    phoneticTranscription,
    translation1,
    translation2,
    usage1,
    usage2,
    translationDef1,
    translationDef2,
  } = params;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const canUseOnlineFeatures = isConnected && !isGuestMode;

  // --------------------------------------------------
  // NETWORK
  // --------------------------------------------------

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

  // --------------------------------------------------
  // GUEST MODE
  // --------------------------------------------------

  const checkGuestMode = async () => {
    try {
      const localGuestMode = await AsyncStorage.getItem('@guest_mode');
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const role = await AsyncStorage.getItem('@user_role');

      const isGuest =
        !session || role === 'guest' || localGuestMode !== null;

      setIsGuestMode(isGuest);
    } catch (error) {
      setIsGuestMode(true);
    }
  };

  // --------------------------------------------------
  // BOOKMARK STATUS
  // --------------------------------------------------

  const verifyBookmarkStatus = async () => {
    if (!id || isGuestMode || !isConnected) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(`${CHECK_SAVED_API_URL}/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsBookmarked(result.isBookmarked);
      }
    } catch (error) {
      console.error(
        'Failed to fetch initial word bookmark state:',
        error
      );
    }
  };

  useEffect(() => {
    verifyBookmarkStatus();
  }, [id, isGuestMode, isConnected]);

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    await checkGuestMode();
    await verifyBookmarkStatus();

    setRefreshing(false);
  }, [id, isGuestMode, isConnected]);

  // --------------------------------------------------
  // LANGUAGE DATA
  // --------------------------------------------------

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

  // --------------------------------------------------
  // SAVE WORD
  // --------------------------------------------------

  const handleSaveWord = async () => {
    if (!id) {
      Alert.alert('Error', 'ID is missing.');
      return;
    }

    if (!isConnected) {
      Alert.alert(
        'Network Offline',
        'You need an internet connection to save words.'
      );
      return;
    }

    setIsSaving(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert('Error', 'Please login to save words.');
        return;
      }

      const response = await fetch(SAVE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          dictionary_id: parseInt(id),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsBookmarked(true);

        Alert.alert(
          'Saved!',
          `"${wordTerm}" has been added to your saved words.`
        );
      } else {
        throw new Error(result.message || 'Failed to save.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* OFFLINE NOTICE */}
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            OFFLINE MODE • ONLINE ACTIONS DISABLED
          </Text>
        </View>
      )}

      {/* HEADER */}
      <ProfileTopBar title="Dictionary" />

      <RefreshContainer
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.scrollPadding}
      >

        {/* =========================
            WORD HERO
        ========================== */}
        <View style={styles.heroCard}>

          <Text style={styles.heroLabel}>
            DICTIONARY ENTRY
          </Text>

          <Text
            style={styles.heroWord}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {wordTerm}
          </Text>

          {phoneticTranscription ? (
            <Text style={styles.heroPronounce}>
              /{phoneticTranscription}/
            </Text>
          ) : null}

          {partOfSpeech ? (
            <View style={styles.partOfSpeechBadge}>
              <Text style={styles.partOfSpeechText}>
                {partOfSpeech}
              </Text>
            </View>
          ) : null}

        </View>

        {/* =========================
            DEFINITIONS
        ========================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Definitions & Meanings
          </Text>

          {/* CEBUANO */}
          <View
            style={[
              styles.languageCard,
              currentLangId === 3 && styles.currentLanguageCard,
            ]}
          >
            <View style={styles.languageHeaderRow}>
              <Text style={styles.languageLabel}>
                CEBUANO
              </Text>

              {currentLangId === 3 && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>
                    CURRENT
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.languageTerm}>
              {cebuanoTerm}
            </Text>

            <Text style={styles.languageDefinition}>
              {cebuanoDef}
            </Text>
          </View>

          {/* TAGALOG */}
          <View
            style={[
              styles.languageCard,
              currentLangId !== 3 && styles.currentLanguageCard,
            ]}
          >
            <View style={styles.languageHeaderRow}>
              <Text style={styles.languageLabel}>
                TAGALOG
              </Text>

              {currentLangId !== 3 && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>
                    CURRENT
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.languageTerm}>
              {tagalogTerm}
            </Text>

            <Text style={styles.languageDefinition}>
              {tagalogDef}
            </Text>
          </View>

          {/* ENGLISH */}
          <View style={styles.languageCard}>
            <View style={styles.languageHeaderRow}>
              <Text style={styles.languageLabel}>
                ENGLISH
              </Text>
            </View>

            <Text style={styles.languageTerm}>
              {wordTerm}
            </Text>

            <Text style={styles.languageDefinition}>
              {currentLangId === 3
                ? translationDef1 || 'No English translation available.'
                : translationDef2 || 'No English translation available.'}
            </Text>
          </View>
        </View>

        {/* =========================
            USAGE EXAMPLES
        ========================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Usage Examples
          </Text>

          <View style={styles.exampleCard}>

            <View style={styles.exampleItem}>
              <Text style={styles.exampleLanguage}>
                {wordTerm}
              </Text>

              <Text style={styles.exampleText}>
                {exampleUsage || 'No example available.'}
              </Text>
            </View>

            {translation1 ? (
              <View style={styles.exampleItem}>
                <Text style={styles.exampleLanguage}>
                  {translation1}
                </Text>

                <Text style={styles.exampleText}>
                  {usage1 || 'No example available.'}
                </Text>
              </View>
            ) : null}

            {translation2 ? (
              <View style={styles.exampleItem}>
                <Text style={styles.exampleLanguage}>
                  {translation2}
                </Text>

                <Text style={styles.exampleText}>
                  {usage2 || 'No example available.'}
                </Text>
              </View>
            ) : null}

          </View>
        </View>

        {/* EXTRA SPACE FOR SAVE BUTTON */}
        <View style={{ height: 100 }} />

      </RefreshContainer>

      {/* =========================
          SAVE WORD BUTTON
      ========================== */}
      <View style={styles.saveButtonWrapper}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            isBookmarked && styles.savedButton,
            !isConnected &&
            !isBookmarked &&
            styles.disabledSaveButton,
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
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Image
                source={require('../../../assets/icons/star.png')}
                style={[
                  styles.starIcon,
                  isBookmarked && styles.savedStarIcon,
                ]}
              />

              <Text
                style={[
                  styles.saveButtonText,
                  isBookmarked && styles.savedButtonText,
                ]}
              >
                {isBookmarked ? 'SAVED' : 'SAVE WORD'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <FeatureGateModal
        visible={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
      />

      {/* BottomNav intentionally removed */}
    </View>
  );
}