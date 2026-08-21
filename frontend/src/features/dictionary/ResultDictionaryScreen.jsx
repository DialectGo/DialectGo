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
import RefreshContainer from '../../shared/components/RefreshContainer';
import ProfileTopBar from '../../components/ProfileTopBar';
import { styles } from './styles/ResultDictionaryStyles';
import FeatureGateModal from '../../shared/components/FeatureGateModal';
import { useDictionaryGuestMode } from '../../shared/hooks/dictionary/useDictionaryGuestMode';
import { useDictionaryBookmark } from '../../shared/hooks/dictionary/useDictionaryBookmark';
import { formatDictionaryTerms } from '../../shared/utils/dictionaryFormatUtils';

export default function ResultDictionaryScreen() {
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

  const [refreshing, setRefreshing] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  // --------------------------------------------------
  // GLOBAL STATE
  // --------------------------------------------------
  const { isGuestMode, isConnected, checkGuestMode } = useDictionaryGuestMode();
  const canUseOnlineFeatures = isConnected && !isGuestMode;

  // --------------------------------------------------
  // BOOKMARK ORCHESTRATION
  // --------------------------------------------------
  const { isBookmarked, isSaving, verifyBookmarkStatus, handleSaveWord } = 
    useDictionaryBookmark(id, isGuestMode, isConnected, wordTerm);

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkGuestMode();
    await verifyBookmarkStatus();
    setRefreshing(false);
  }, [checkGuestMode, verifyBookmarkStatus]);

  // --------------------------------------------------
  // LANGUAGE DATA
  // --------------------------------------------------
  const {
    currentLangId,
    cebuanoTerm,
    cebuanoDef,
    tagalogTerm,
    tagalogDef,
  } = formatDictionaryTerms({
    languageId,
    wordTerm,
    definition,
    translation1,
    translation2,
    translationDef1,
    translationDef2,
  });

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
                source={require('../../../assets/icons/status/star.png')}
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