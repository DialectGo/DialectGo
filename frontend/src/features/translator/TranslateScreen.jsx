import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, LayoutAnimation } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../../components/BottomNav';
import TopBar from '../../components/TopBar';
import ContributionModal from '../wiki/components/ContributionModal';
import LoadingModal from '../../shared/components/LoadingModal';
import CustomizeModal from '../../shared/components/CustomizeModal';
import { styles } from './styles/TranslateStyles';
import translateIcon from '../../../assets/icons/bottombar/translateIcon.png';

import LanguageSelector from '../../shared/components/translate/LanguageSelector';
import BreakdownPanel from '../../shared/components/translate/BreakdownPanel';
import DocumentUploadModal from '../../shared/components/translate/DocumentUploadModal';
import TranslationResultModal from '../../shared/components/translate/TranslationResultModal';
import SpeechModal from '../../shared/components/translate/SpeechModal';

import InputCard from '../../shared/components/translate/InputCard';
import ResultCard from '../../shared/components/translate/ResultCard';
import TranslateActionSheets from '../../shared/components/translate/TranslateActionSheets';

import { useTranslate } from '../../shared/hooks/translate/useTranslate';

export default function TranslateScreen({ activeTab, onNavigate }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    modalVisible, setModalVisible,
    feedbackModalVisible, setFeedbackModalVisible,
    rateModalVisible, setRateModalVisible,
    moreMenuVisible, setMoreMenuVisible,
    speechModalVisible, setSpeechModalVisible,
    selectingFor, setSelectingFor,
    isLoading, error,
    sourceLang, setSourceLang,
    targetLang, setTargetLang,
    targetDialect, setTargetDialect,
    inputText, setInputText,
    translation, setTranslation,
    feedback, setFeedback,
    comment, setComment,
    suggestionText, setSuggestionText,
    breakdownData, setBreakdownData,
    isBreakdownLoading, breakdownPanelVisible, setBreakdownPanelVisible,
    showCustomize, setShowCustomize, isCustomizeLoading,
    isPlayingAudio, skipDebounceRef,
    docUploadVisible, setDocUploadVisible,
    docResultVisible, setDocResultVisible,
    isDocTranslating, docResult, docError,
    playTranslatedAudio, playBase64Audio, handleCopy,
    handleQuickRating, handleDetailedSubmit, handleShowBreakdown,
    handleCustomizeSubmit, handleDocumentSelected, selectLanguage
  } = useTranslate();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ animation: "fade" }} />
      <StatusBar style="dark" />
      <TopBar 
        titlePrimary="DialectGo" 
        titleSecondary="Translator" 
        screenType="translator"
        onHistoryPress={() => router.push('/Translator/TranslationHistory')}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top + 55 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.content}>

          <LanguageSelector
            sourceLang={sourceLang} targetLang={targetLang}
            onSwap={() => {
              const temp = sourceLang; setSourceLang(targetLang); setTargetLang(temp);
              setTargetDialect(null);
            }}
            onSelectSource={() => { setSelectingFor('source'); setModalVisible(true); }}
            onSelectTarget={() => { setSelectingFor('target'); setModalVisible(true); }}
            translateIcon={translateIcon}
          />

          <InputCard
            sourceLang={sourceLang}
            targetLang={targetLang}
            inputText={inputText}
            setInputText={setInputText}
            setBreakdownData={setBreakdownData}
            setDocUploadVisible={setDocUploadVisible}
            setSpeechModalVisible={setSpeechModalVisible}
            targetDialect={targetDialect}
            setTargetDialect={setTargetDialect}
          />

          {inputText.length > 0 && !error && (
            <ResultCard
              targetLang={targetLang}
              isLoading={isLoading}
              translation={translation}
              isPlayingAudio={isPlayingAudio}
              playTranslatedAudio={playTranslatedAudio}
              handleCopy={handleCopy}
              setRateModalVisible={setRateModalVisible}
              feedback={feedback}
              setMoreMenuVisible={setMoreMenuVisible}
            />
          )}

          {inputText.length > 0 && breakdownData && !isLoading && (
            <TouchableOpacity 
              style={styles.reviewBreakdownBtn} 
              onPress={() => setBreakdownPanelVisible(true)}
            >
              <Ionicons name="bulb" size={20} color="#F59E0B" />
              <Text style={styles.reviewBreakdownText}>Review AI Breakdown</Text>
            </TouchableOpacity>
          )}

          {breakdownData && (
            <BreakdownPanel
              visible={breakdownPanelVisible}
              onClose={() => setBreakdownPanelVisible(false)}
              breakdown={breakdownData}
              isLoading={isBreakdownLoading}
              onSelectAlternative={(text) => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setTranslation(text);
                setBreakdownData(null);
                setBreakdownPanelVisible(false);
              }}
            />
          )}

          <LoadingModal visible={isBreakdownLoading} message="Analyzing translation..." />

          <TranslateActionSheets
            rateModalVisible={rateModalVisible}
            setRateModalVisible={setRateModalVisible}
            handleQuickRating={handleQuickRating}
            feedback={feedback}
            moreMenuVisible={moreMenuVisible}
            setMoreMenuVisible={setMoreMenuVisible}
            setFeedbackModalVisible={setFeedbackModalVisible}
            handleShowBreakdown={handleShowBreakdown}
            setShowCustomize={setShowCustomize}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            selectingFor={selectingFor}
            sourceLang={sourceLang}
            targetLang={targetLang}
            selectLanguage={selectLanguage}
          />
        </View>
      </ScrollView>

      <ContributionModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        onSubmit={handleDetailedSubmit}
        feedbackComment={comment}
        setFeedbackComment={setComment}
        suggestedTranslation={suggestionText}
        setSuggestedTranslation={setSuggestionText}
      />

      <CustomizeModal
        visible={showCustomize}
        onClose={() => setShowCustomize(false)}
        onSubmit={handleCustomizeSubmit}
        isLoading={isCustomizeLoading}
      />

      <DocumentUploadModal 
        visible={docUploadVisible} 
        onClose={() => setDocUploadVisible(false)} 
        onFileSelected={handleDocumentSelected}
      />

      <TranslationResultModal
        visible={docResultVisible}
        onClose={() => setDocResultVisible(false)}
        isLoading={isDocTranslating}
        result={docResult}
        error={docError}
      />

      <SpeechModal
        visible={speechModalVisible}
        onClose={() => setSpeechModalVisible(false)}
        sourceLang={sourceLang}
        targetLang={targetLang}
        onTranscript={(transcript) => {
          skipDebounceRef.current = true;
          setInputText(transcript);
        }}
        onTranslation={(translatedText) => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setTranslation(translatedText.trim());
        }}
        onAudioResult={(audioBase64) => {
          requestAnimationFrame(() => {
            playBase64Audio(audioBase64);
          });
        }}
      />

      <BottomNav activeTab={activeTab} setActiveTab={onNavigate} />
    </View>
  );
}
