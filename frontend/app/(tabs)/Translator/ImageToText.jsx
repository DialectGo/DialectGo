import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, ScrollView, LayoutAnimation, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../shared/lib/supabase';

// Components & Icons
import LanguageSelector from '../../../shared/components/LanguageSelector';
import ResultCard from '../../../shared/components/ResultCard';
import translateIcon from '../../../assets/icons/translateIcon.png';
import cameraIcon from '../../../assets/icons/cameraIcon.png'; 
import galleryIcon from '../../../assets/icons/camera.png'; // Make sure you have this
import pronounceIcon from '../../../assets/icons/pronounceIcon.png';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { TRANSLATION_API_BASE } from '../../../shared/config/apiConfig';
const API_URL = `${TRANSLATION_API_BASE}/translate/image`;

// --- Sub-components ---

function ScanViewfinder({ selectedImage }) {
  return (
    <View style={styles.viewfinderContainer}>
      <View style={styles.viewfinderFrame}>
        {/* The 4 Corner Borders */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />

        <View style={styles.imageInnerContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderBox}>
               {/* Background grid/map texture placeholder */}
               <Text style={styles.placeholderText}>Scan Text</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.instructionText}>Align text inside the box</Text>
    </View>
  );
}

function ActionButtons({ onPickImage, loading }) {
  return (
    <View style={styles.buttonWrapper}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => onPickImage('library')}
          disabled={loading}
        >
          <Image source={galleryIcon} style={styles.btnIcon} />
          <Text style={styles.btnLabel}>Gallery</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => onPickImage('camera')}
          disabled={loading}
        >
          <Image source={cameraIcon} style={styles.btnIcon} />
          <Text style={styles.btnLabel}>Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Main Export ---

export default function ImageToText() {
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [selectedImage, setSelectedImage] = useState(null);
  const [translatedText, setTranslatedText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const handlePickImage = async (mode) => {
    const permission = mode === 'camera' 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Denied", "DialectoGo needs access to scan text.");
      return;
    }

    const result = await (mode === 'camera' 
      ? ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 })
      : ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 }));

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      processOCR(result.assets[0]);
    }
  };

  const processOCR = async (asset) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const formData = new FormData();
      formData.append('image', { uri: asset.uri, name: 'ocr.jpg', type: 'image/jpeg' });
      formData.append('sourceLang', sourceLang);
      formData.append('targetLang', targetLang);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setTranslatedText(data.translatedText);
        animate();
        setShowResult(true);
      } else {
        throw new Error(data.message || "Scan failed");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan & Translate</Text>
      </View>
      <TouchableOpacity 
        style={styles.liveModeBtn} 
        onPress={() => router.push('/Translator/LiveCamera')}
      >
        <Ionicons name="scan-circle" size={28} color="#FBBF24" />
        <Text>Switch to Live AR</Text>
      </TouchableOpacity>

      <LanguageSelector 
        sourceLang={sourceLang} targetLang={targetLang}
        translateIcon={translateIcon}
        onSwap={() => { setSourceLang(targetLang); setTargetLang(sourceLang); }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScanViewfinder selectedImage={selectedImage} />
        
        {showResult && (
          <View style={styles.resultContainer}>
             <ResultCard 
                translatedText={translatedText} 
                targetLang={targetLang} 
                onClose={() => { animate(); setShowResult(false); }}
                pronounceIcon={pronounceIcon}
             />
          </View>
        )}
      </ScrollView>

      <ActionButtons onPickImage={handlePickImage} loading={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    backgroundColor: '#FBBF24', 
    padding: 20, 
    flexDirection: 'row', // Align button and title horizontally
    alignItems: 'center',
    justifyContent: 'center', // Center the title
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    backgroundColor: '#FFF', // White background like your screenshot
    padding: 8,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#000' 
  },
  scrollContent: { paddingBottom: 150 },
  
  // Viewfinder UI
  viewfinderContainer: { alignItems: 'center', marginTop: 30 },
  viewfinderFrame: {
    width: 300,
    height: 300,
    backgroundColor: '#FFFBEB',
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#FBBF24',
    padding: 15,
    position: 'relative',
  },
  imageInnerContainer: { flex: 1, borderRadius: 15, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  placeholderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#D1D5DB', fontWeight: 'bold' },
  instructionText: { marginTop: 15, fontStyle: 'italic', color: '#6B7280', fontSize: 12 },
  
  // Corner Accents
  corner: { position: 'absolute', width: 25, height: 25, borderColor: '#374151', borderWidth: 2 },
  topLeft: { top: 10, left: 10, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 10, right: 10, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 10, left: 10, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 10, right: 10, borderTopWidth: 0, borderLeftWidth: 0 },

  // Buttons
  buttonWrapper: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: '#FBBF24',
    borderRadius: 15,
    width: '80%',
    height: 70,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  actionBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnIcon: { width: 24, height: 24, marginBottom: 5 },
  btnLabel: { fontSize: 12, fontWeight: '600' },
  divider: { width: 1, backgroundColor: '#D97706', height: '100%' },
  resultContainer: { marginTop: 20, width: '100%', paddingHorizontal: 20 }
});