import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  LayoutAnimation,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import BottomNav from '../../../src/components/BottomNav';
import TopBar from '../../../src/components/TopBar';
import LanguageSelector from '../../../src/features/translator/components/LanguageSelector';
import ContributionModal from '../../../src/features/wiki/components/ContributionModal';
import BreakdownPanel from '../../../src/features/translator/components/BreakdownPanel';
import LoadingModal from '../../../src/shared/components/LoadingModal';
import CustomizeModal from '../../../src/shared/components/CustomizeModal';
import DocumentUploadModal from '../../../src/features/translator/components/DocumentUploadModal';
import TranslationResultModal from '../../../src/features/translator/components/TranslationResultModal';
import SwipeableBottomSheet from '../../../src/shared/components/SwipeableBottomSheet';
import SpeechModal from '../../../src/features/translator/components/SpeechModal';
import { styles } from '../../../src/features/translator/styles/TranslateStyles';
import translateIcon from '../../../assets/icons/bottombar/translateIcon.png';

// Import our new custom hook and constants
import { useTranslate, LANGUAGES, DIALECT_OPTIONS } from '../../../src/shared/hooks/translate/useTranslate';

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
        onHistoryPress={() => router.push('/History/History')}
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

          {/* INPUT CARD */}
          <View style={styles.translateCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.inputLabel}>{sourceLang.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => { setInputText(''); setBreakdownData(null); }}>
                <Ionicons name="close-circle" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.mainInput}
              placeholder="Type something to translate..."
              placeholderTextColor="#9CA3AF"
              multiline value={inputText}
              onChangeText={setInputText}
            />
            <View style={styles.cardFooter}>
              <View style={[styles.shortcutIcons, { alignItems: 'center', gap: 8 }]}>
                <TouchableOpacity onPress={() => setDocUploadVisible(true)} style={styles.iconBtn}>
                  <Ionicons name="document-text" size={22} color="#1F2937" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSpeechModalVisible(true)} style={styles.iconBtn}>
                  <Ionicons name="mic" size={22} color="#1F2937" />
                </TouchableOpacity>
              </View>

              {/* DIALECT VARIANT SELECTOR */}
              {DIALECT_OPTIONS[targetLang] && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  {DIALECT_OPTIONS[targetLang].map((option) => (
                    <TouchableOpacity
                      key={option.label}
                      onPress={() => setTargetDialect(option.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 16,
                        backgroundColor: targetDialect === option.value ? '#FBBF24' : '#F3F4F6',
                        borderWidth: 1,
                        borderColor: targetDialect === option.value ? '#F59E0B' : '#E5E7EB',
                      }}
                    >
                      <Text style={{
                        fontSize: 11,
                        fontWeight: targetDialect === option.value ? '700' : '500',
                        color: targetDialect === option.value ? '#1F2937' : '#6B7280',
                      }}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* RESULT CARD */}
          {inputText.length > 0 && !error && (
            <View style={[styles.translateCard, styles.resultCardExtra]}>
              <View style={styles.cardHeader}>
                <Text style={styles.inputLabel}>{targetLang.toUpperCase()}</Text>
              </View>
              {isLoading ? (
                <View style={styles.loadingArea}>
                  <ActivityIndicator size="small" color="#FBBF24" />
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultText}>{translation || "Waiting..."}</Text>
                  {/* Output Toolbar */}
                  {translation ? (
                    <View style={styles.outputToolbar}>
                      {/* Left: Speaker */}
                      <TouchableOpacity
                        onPress={() => playTranslatedAudio(translation, targetLang)}
                        style={styles.outputToolbarBtn}
                      >
                        <Ionicons
                          name={isPlayingAudio ? 'volume-high' : 'volume-medium-outline'}
                          size={20}
                          color={isPlayingAudio ? '#FBBF24' : '#1F2937'}
                        />
                      </TouchableOpacity>

                      {/* Right: Copy, Rate, More */}
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={handleCopy} style={[styles.outputToolbarBtn, { marginRight: 10 }]}>
                          <Ionicons name="copy-outline" size={20} color="#1F2937" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setRateModalVisible(true)}
                          style={[styles.outputToolbarBtn, { marginRight: 10 }]}
                        >
                          <MaterialIcons
                            name="thumbs-up-down"
                            size={20}
                            color={feedback ? '#FBBF24' : '#1F2937'}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setMoreMenuVisible(true)}
                          style={styles.outputToolbarBtn}
                        >
                          <Ionicons name="ellipsis-horizontal" size={20} color="#1F2937" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          )}

          {/* REVIEW BREAKDOWN BUTTON */}
          {inputText.length > 0 && breakdownData && !isLoading && (
            <TouchableOpacity 
              style={styles.reviewBreakdownBtn} 
              onPress={() => setBreakdownPanelVisible(true)}
            >
              <Ionicons name="bulb" size={20} color="#F59E0B" />
              <Text style={styles.reviewBreakdownText}>Review AI Breakdown</Text>
            </TouchableOpacity>
          )}

          {/* BREAKDOWN PANEL MODAL */}
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

          {/* RATE MODAL */}
          <SwipeableBottomSheet visible={rateModalVisible} onClose={() => setRateModalVisible(false)}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 20 }}>Rate this translation</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => { handleQuickRating(5); setRateModalVisible(false); }}
                style={[styles.rateBtn, feedback === 'like' && styles.rateBtnActive]}
              >
                <Ionicons name="thumbs-up" size={26} color={feedback === 'like' ? '#FBBF24' : '#6B7280'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { handleQuickRating(1); setRateModalVisible(false); }}
                style={[styles.rateBtn, feedback === 'unlike' && styles.rateBtnActive]}
              >
                <Ionicons name="thumbs-down" size={26} color={feedback === 'unlike' ? '#FBBF24' : '#6B7280'} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
              Your feedback will be used to help improve the product
            </Text>
          </SwipeableBottomSheet>

          {/* THREE-DOTS MORE MENU */}
          <SwipeableBottomSheet visible={moreMenuVisible} onClose={() => setMoreMenuVisible(false)}>
            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => { setMoreMenuVisible(false); setFeedbackModalVisible(true); }}
            >
              <Ionicons name="create-outline" size={22} color="#374151" />
              <Text style={styles.moreMenuText}>Suggest Translation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => { setMoreMenuVisible(false); handleShowBreakdown(); }}
            >
              <Ionicons name="analytics-outline" size={22} color="#374151" />
              <Text style={styles.moreMenuText}>Breakdown</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => { setMoreMenuVisible(false); setShowCustomize(true); }}
            >
              <Ionicons name="color-wand-outline" size={22} color="#374151" />
              <Text style={styles.moreMenuText}>Customize</Text>
            </TouchableOpacity>
          </SwipeableBottomSheet>
        </View>
      </ScrollView>

      {/* SHARED CONTRIBUTION MODAL */}
      <ContributionModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        onSubmit={handleDetailedSubmit}
        feedbackComment={comment}
        setFeedbackComment={setComment}
        suggestedTranslation={suggestionText}
        setSuggestedTranslation={setSuggestionText}
      />

      {/* CUSTOMIZE MODAL */}
      <CustomizeModal
        visible={showCustomize}
        onClose={() => setShowCustomize(false)}
        onSubmit={handleCustomizeSubmit}
        isLoading={isCustomizeLoading}
      />

      {/* DOCUMENT UPLOAD MODAL */}
      <DocumentUploadModal 
        visible={docUploadVisible} 
        onClose={() => setDocUploadVisible(false)} 
        onFileSelected={handleDocumentSelected}
      />

      {/* DOCUMENT TRANSLATION RESULT MODAL */}
      <TranslationResultModal
        visible={docResultVisible}
        onClose={() => setDocResultVisible(false)}
        isLoading={isDocTranslating}
        result={docResult}
        error={docError}
      />

      {/* LANGUAGE PICKER MODAL */}
      <SwipeableBottomSheet visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text style={styles.sheetTitle}>Select Language</Text>
        {LANGUAGES.map((item) => (
          <TouchableOpacity key={item.id} style={styles.sheetItem} onPress={() => selectLanguage(item)}>
            <Text style={[styles.sheetItemText, (selectingFor === 'source' ? sourceLang : targetLang) === item.name && styles.activeSheetText]}>
              {item.name}
            </Text>
            {(selectingFor === 'source' ? sourceLang : targetLang) === item.name && <Ionicons name="checkmark-circle" size={22} color="#FBBF24" />}
          </TouchableOpacity>
        ))}
      </SwipeableBottomSheet>

      {/* SPEECH MODAL */}
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