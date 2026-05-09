import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text, 
  Alert, 
  ActivityIndicator, 
  Modal, 
  LayoutAnimation,
  StatusBar
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { supabase } from '../../shared/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Components & Icons
import LanguageSelector from '../../shared/components/LanguageSelector';
import translateIcon from '../../assets/icons/translateIcon.png';

const API_URL = 'http://192.168.1.53:5001/api/translate/image';

// Consistent ID Mapping
const LANGUAGE_MAP = [
  { name: 'English', id: 1 },
  { name: 'Tagalog', id: 2 },
  { name: 'Cebuano', id: 3 },
];

export default function ARTranslator() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  
  // Language State
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState('source');

  // Logic State
  const [isProcessing, setIsProcessing] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);

  const animateUI = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText} onPress={requestPermission}>
          Grant Camera Access to use AR Translation
        </Text>
      </View>
    );
  }

  // --- LANGUAGE SELECTION LOGIC ---
  const openPicker = (type) => {
    setSelectingFor(type);
    setModalVisible(true);
  };

  const selectLanguage = (langObj) => {
    animateUI();
    if (selectingFor === 'source') {
      if (langObj.name === targetLang) setTargetLang(sourceLang);
      setSourceLang(langObj.name);
    } else {
      if (langObj.name === sourceLang) setSourceLang(targetLang);
      setTargetLang(langObj.name);
    }
    setModalVisible(false);
    setTranslationResult(null); // Clear previous results
  };

  const swapLanguages = () => {
    animateUI();
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setTranslationResult(null);
  };

  // --- TRANSLATION LOGIC ---
  const takePictureAndTranslate = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      setTranslationResult(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          Alert.alert("Authentication Required", "Please log in.");
          setIsProcessing(false);
          return;
        }

        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.3,
          width: 800,
          doNotSave: true,
        });

        const sId = LANGUAGE_MAP.find(l => l.name === sourceLang)?.id;
        const tId = LANGUAGE_MAP.find(l => l.name === targetLang)?.id;

        const response = await axios.post(API_URL, {
          image: photo.base64,
          targetLang: targetLang,
          sourceLang: sourceLang,
          source_language_id: sId,
          target_language_id: tId
        }, {
          headers: { 
            'Authorization': `Bearer ${session.access_token}` 
          }
        });

        if (response.data.translatedText) {
          animateUI();
          setTranslationResult(response.data.translatedText);
        }
      } catch (e) {
        console.error("Translation error:", e.response?.data || e.message);
        Alert.alert("Error", "Failed to translate image.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Camera View */}
      <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} />

      {/* OVERLAY UI */}
      <View style={styles.overlay}>
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#1F2937" />
          </TouchableOpacity>

          <View style={styles.selectorWrapper}>
            <LanguageSelector 
              sourceLang={sourceLang} 
              targetLang={targetLang}
              translateIcon={translateIcon}
              onSwap={swapLanguages}
              onSelectSource={() => openPicker('source')}
              onSelectTarget={() => openPicker('target')}
              isDarkBackground={true} // Optional: Add prop if you want to style it for camera
            />
          </View>
        </View>

        {/* Floating Result Card */}
        {translationResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
                <Text style={styles.resultLabel}>{targetLang.toUpperCase()}</Text>
                <TouchableOpacity onPress={() => setTranslationResult(null)}>
                    <Ionicons name="close-circle" size={20} color="#D1D5DB" />
                </TouchableOpacity>
            </View>
            <Text style={styles.resultText}>{translationResult}</Text>
          </View>
        )}

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={[styles.captureButton, isProcessing && styles.disabledButton]} 
          onPress={takePictureAndTranslate}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="scan-outline" size={24} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>SCAN & TRANSLATE</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* MODAL PICKER - FIXED LINE 198 */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            {/* Change <div> to <View> below */}
            <View style={styles.sheetHandle} /> 
            
            <Text style={styles.sheetTitle}>Select Language</Text>
            {LANGUAGE_MAP.map((item) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, paddingHorizontal: 20, justifyContent: 'space-between', paddingBottom: 40 },
  topControls: { marginTop: 50 },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginBottom: 15
  },
  selectorWrapper: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: 20,
      padding: 5
  },
  captureButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#FBBF24',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    alignItems: 'center'
  },
  disabledButton: { backgroundColor: '#FDE68A' },
  buttonText: { fontWeight: '900', color: '#000', fontSize: 14, letterSpacing: 1 },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#FBBF24'
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resultLabel: { fontSize: 10, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1 },
  resultText: { fontSize: 20, color: '#1F2937', textAlign: 'center', fontWeight: '700' },
  
  // MODAL STYLES (Identical to SpeechToText/Translate)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 20, textAlign: 'center' },
  sheetItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sheetItemText: { fontSize: 18, fontWeight: '600', color: '#4B5563' },
  activeSheetText: { color: '#FBBF24', fontWeight: '800' },
  closeSheet: { marginTop: 20, alignItems: 'center', padding: 15, backgroundColor: '#F9FAFB', borderRadius: 15 },
  closeSheetText: { color: '#9CA3AF', fontWeight: '700', fontSize: 16 }
});