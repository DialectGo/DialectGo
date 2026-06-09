import React, { useState, useRef } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Text, Alert, 
  ActivityIndicator, Modal, LayoutAnimation, StatusBar, Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';

// Shared Utilities & Components
import { supabase } from '../../shared/lib/supabase';
import LanguageSelector from '../../shared/components/LanguageSelector';
import ContributionModal from '../../shared/components/ContributionModal';
import translateIcon from '../../assets/icons/translateIcon.png';

import { TRANSLATION_API_BASE } from '../../shared/config/apiConfig';
const ENDPOINTS = {
  TRANSLATE: `${TRANSLATION_API_BASE}/translate/image`,
  FEEDBACK: `${TRANSLATION_API_BASE}/feedback`,
  CONTRIBUTE: `${TRANSLATION_API_BASE}/translate/contribute`,
};

const LANGUAGE_MAP = [
  { name: 'English', id: 1 },
  { name: 'Tagalog', id: 2 },
  { name: 'Cebuano', id: 3 },
];

export default function ARTranslator() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  
  // UI & Language State
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState('source');
  const [isProcessing, setIsProcessing] = useState(false);

  // Translation & Feedback State
  const [translationResult, setTranslationResult] = useState(null);
  const [transcript, setTranscript] = useState(''); 
  const [currentTranslationId, setCurrentTranslationId] = useState(null);
  const [feedback, setFeedback] = useState(null); 
  const [isDetailedModalVisible, setIsDetailedModalVisible] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [suggestedTranslation, setSuggestedTranslation] = useState('');

  const animateUI = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  // --- API HANDLERS ---

  const handleQuickRating = async (ratingValue) => {
    if (!currentTranslationId) return Alert.alert("Wait", "Translate something first.");
    
    setFeedback(ratingValue === 5 ? 'like' : 'unlike');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.post(ENDPOINTS.FEEDBACK, {
        translationId: currentTranslationId,
        rating: ratingValue,
      }, { headers: { Authorization: `Bearer ${session.access_token}` } });
      
      setIsDetailedModalVisible(true);
    } catch (err) { console.error("Feedback error:", err); }
  };

  const handleDetailedSubmit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = { headers: { Authorization: `Bearer ${session.access_token}` } };

      if (feedbackComment.trim()) {
        await axios.post(ENDPOINTS.FEEDBACK, {
          translationId: currentTranslationId,
          rating: feedback === 'like' ? 5 : 1,
          comment: feedbackComment
        }, authHeader);
      }

      if (suggestedTranslation.trim()) {
        await axios.post(ENDPOINTS.CONTRIBUTE, {
          sourceText: transcript,
          userTranslation: suggestedTranslation,
          sourceLang,
          targetLang,
          source_language_id: LANGUAGE_MAP.find(l => l.name === sourceLang)?.id,
          target_language_id: LANGUAGE_MAP.find(l => l.name === targetLang)?.id,
        }, authHeader);
      }

      Alert.alert("Success", "Thank you for improving DialectoGo!");
      setIsDetailedModalVisible(false);
      setFeedbackComment('');
      setSuggestedTranslation('');
    } catch (err) { Alert.alert("Error", "Contribution sync failed."); }
  };

  const takePictureAndTranslate = async () => {
    if (!cameraRef.current || isProcessing) return;
    
    setIsProcessing(true);
    setTranslationResult(null);
    setFeedback(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.3, width: 800, doNotSave: true });

      const response = await axios.post(ENDPOINTS.TRANSLATE, {
        image: photo.base64,
        targetLang,
        sourceLang,
        source_language_id: LANGUAGE_MAP.find(l => l.name === sourceLang)?.id,
        target_language_id: LANGUAGE_MAP.find(l => l.name === targetLang)?.id
      }, { headers: { Authorization: `Bearer ${session.access_token}` } });

      if (response.data.translatedText) {
        animateUI();
        setTranslationResult(response.data.translatedText);
        setTranscript(response.data.sourceText || "Image Text");
        setCurrentTranslationId(response.data.historyRecord?.id);
      }
    } catch (e) { Alert.alert("Error", "Image translation failed."); }
    finally { setIsProcessing(false); }
  };

  // --- RENDER LOGIC ---

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText} onPress={requestPermission}>Grant Camera Access</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} />

      <View style={styles.overlay}>
        {/* Top Navigation & Language Selection */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.selectorWrapper}>
            <LanguageSelector 
              sourceLang={sourceLang} targetLang={targetLang}
              translateIcon={translateIcon} onSwap={() => {
                animateUI(); setSourceLang(targetLang); setTargetLang(sourceLang); setTranslationResult(null);
              }}
              onSelectSource={() => { setSelectingFor('source'); setModalVisible(true); }}
              onSelectTarget={() => { setSelectingFor('target'); setModalVisible(true); }}
              isDarkBackground
            />
          </View>
        </View>

        {/* Translation Result Card */}
        {translationResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>{targetLang.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => setTranslationResult(null)}>
                <Ionicons name="close-circle" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
            <Text style={styles.resultText}>{translationResult}</Text>
            <View style={styles.feedbackRow}>
              <TouchableOpacity onPress={() => handleQuickRating(5)}>
                <Ionicons name={feedback === 'like' ? "thumbs-up" : "thumbs-up-outline"} size={24} color={feedback === 'like' ? "#FBBF24" : "#9CA3AF"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleQuickRating(1)}>
                <Ionicons name={feedback === 'unlike' ? "thumbs-down" : "thumbs-down-outline"} size={24} color={feedback === 'unlike' ? "#EF4444" : "#9CA3AF"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsDetailedModalVisible(true)}>
                <Ionicons name="create-outline" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Contribution Modal */}
        <ContributionModal 
          visible={isDetailedModalVisible}
          onClose={() => setIsDetailedModalVisible(false)}
          onSubmit={handleDetailedSubmit}
          feedbackComment={feedbackComment}
          setFeedbackComment={setFeedbackComment}
          suggestedTranslation={suggestedTranslation}
          setSuggestedTranslation={setSuggestedTranslation}
        />

        {/* Capture Button */}
        <TouchableOpacity 
          style={[styles.captureButton, isProcessing && styles.disabledButton]} 
          onPress={takePictureAndTranslate}
          disabled={isProcessing}
        >
          {isProcessing ? <ActivityIndicator color="#000" /> : (
            <><Ionicons name="scan-outline" size={24} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>SCAN & TRANSLATE</Text></>
          )}
        </TouchableOpacity>
      </View>

      {/* Language Picker Bottom Sheet */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Language</Text>
            {LANGUAGE_MAP.map((item) => (
              <TouchableOpacity key={item.id} style={styles.sheetItem} onPress={() => {
                animateUI();
                const current = selectingFor === 'source' ? sourceLang : targetLang;
                if (selectingFor === 'source') {
                   if (item.name === targetLang) setTargetLang(sourceLang);
                   setSourceLang(item.name);
                } else {
                   if (item.name === sourceLang) setSourceLang(targetLang);
                   setTargetLang(item.name);
                }
                setModalVisible(false);
                setTranslationResult(null);
              }}>
                <Text style={[styles.sheetItemText, (selectingFor === 'source' ? sourceLang : targetLang) === item.name && styles.activeSheetText]}>{item.name}</Text>
                {(selectingFor === 'source' ? sourceLang : targetLang) === item.name && <Ionicons name="checkmark-circle" size={22} color="#FBBF24" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeSheet} onPress={() => setModalVisible(false)}><Text style={styles.closeSheetText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, paddingHorizontal: 20, justifyContent: 'space-between', paddingBottom: 40 },
  topControls: { marginTop: 50 },
  backButton: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', elevation: 5, marginBottom: 15 },
  selectorWrapper: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 5 },
  captureButton: { flexDirection: 'row', alignSelf: 'center', backgroundColor: '#FBBF24', paddingVertical: 18, paddingHorizontal: 30, borderRadius: 30, elevation: 5, alignItems: 'center' },
  disabledButton: { backgroundColor: '#FDE68A' },
  buttonText: { fontWeight: '900', color: '#000', fontSize: 14, letterSpacing: 1 },
  resultCard: { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 20, borderRadius: 24, elevation: 10, borderWidth: 1, borderColor: '#FBBF24' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resultLabel: { fontSize: 10, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1 },
  resultText: { fontSize: 20, color: '#1F2937', textAlign: 'center', fontWeight: '700' },
  feedbackRow: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 20, textAlign: 'center' },
  sheetItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sheetItemText: { fontSize: 18, fontWeight: '600', color: '#4B5563' },
  activeSheetText: { color: '#FBBF24', fontWeight: '800' },
  closeSheet: { marginTop: 20, alignItems: 'center', padding: 15, backgroundColor: '#F9FAFB', borderRadius: 15 },
  closeSheetText: { color: '#9CA3AF', fontWeight: '700', fontSize: 16 },
  permissionText: { color: 'white', textAlign: 'center', marginTop: 100 }
});