import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  LayoutAnimation, 
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../shared/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- SHARED COMPONENTS ---
import TopBar from '../../../shared/components/TopBar';

const { width } = Dimensions.get('window');
const API_URL = 'http://192.168.1.50:5001/api/ocr-translate';

export default function ImageToText() {
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [selectedImage, setSelectedImage] = useState(null);
  const [translatedText, setTranslatedText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState('source');

  const scanAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [loading]);

  const animateUI = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const getAvailableLanguages = (type) => {
    const allLangs = ['English', 'Tagalog', 'Cebuano'];
    if (type === 'source') return targetLang !== 'Cebuano' ? ['Cebuano'] : allLangs;
    return sourceLang !== 'Cebuano' ? ['Cebuano'] : allLangs;
  };

  const selectLanguage = (lang) => {
    animateUI();
    if (selectingFor === 'source') {
      setSourceLang(lang);
      if (lang !== 'Cebuano' && targetLang !== 'Cebuano') setTargetLang('Cebuano');
    } else {
      setTargetLang(lang);
      if (lang !== 'Cebuano' && sourceLang !== 'Cebuano') setSourceLang('Cebuano');
    }
    setModalVisible(false);
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Kailangan ng camera access.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        processOCR(asset);
      }
    } catch (error) {
      Alert.alert("Error", "Hindi mabuksan ang camera.");
    }
  };

  const processOCR = async (asset) => {
    setLoading(true);
    setShowResult(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append('image', { uri: asset.uri, name: 'scan.jpg', type: 'image/jpeg' });
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
        animateUI();
        setShowResult(true);
      }
    } catch (err) {
      Alert.alert("Scan Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.75],
  });

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      
      {/* 1. Original TopBar */}
      <TopBar title="DialectGo" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        
        {/* 2. PINAGSAMANG BACK BUTTON AT INTRO (Naka-Align sa Translate Now!) */}
        <View style={styles.headerSection}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={28} color="#1F2937" />
            </TouchableOpacity>

            <View style={styles.introContainer}>
                <Text style={styles.introTitle}>
                    <Text style={styles.blackText}>Translate</Text> <Text style={styles.yellowText}>Now!</Text>
                </Text>
                <Text style={styles.visionTag}>VISION MODE</Text>
            </View>
            
            {/* Empty view for balance spacing */}
            <View style={{ width: 28 }} />
        </View>

        {/* Language Selector */}
        <View style={styles.yellowSelector}>
          <TouchableOpacity style={styles.langSide} onPress={() => { setSelectingFor('source'); setModalVisible(true); }}>
            <Text style={styles.langName}>{sourceLang}</Text>
            <Ionicons name="caret-down" size={12} color="#1F2937" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.swapCircle} onPress={() => { const temp = sourceLang; setSourceLang(targetLang); setTargetLang(temp); }}>
            <Ionicons name="swap-horizontal" size={18} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.langSide} onPress={() => { setSelectingFor('target'); setModalVisible(true); }}>
            <Text style={styles.langName}>{targetLang}</Text>
            <Ionicons name="caret-down" size={12} color="#1F2937" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Viewfinder Area */}
        <View style={styles.viewfinderWrapper}>
          <View style={styles.viewfinder}>
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.fullImage} />
                {loading && <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="camera-outline" size={40} color="#FBBF24" style={{ opacity: 0.3 }} />
                <Text style={styles.emptyText}>Tap capture to scan</Text>
              </View>
            )}
            <View style={[styles.guide, styles.tl]} />
            <View style={[styles.guide, styles.tr]} />
            <View style={[styles.guide, styles.bl]} />
            <View style={[styles.guide, styles.br]} />
          </View>
        </View>

        {showResult && (
          <View style={styles.resultContainer}>
             <View style={styles.resultHeader}>
                <Text style={styles.resultTag}>{targetLang.toUpperCase()}</Text>
                <TouchableOpacity onPress={() => setShowResult(false)}>
                  <Ionicons name="close" size={18} color="#9CA3AF" />
                </TouchableOpacity>
             </View>
             <Text style={styles.resultText}>{translatedText}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Capture */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.captureBtn} onPress={handlePickImage} disabled={loading}>
          <View style={styles.captureInner}>
            {loading ? <ActivityIndicator color="#000" size="small" /> : <Ionicons name="camera" size={24} color="#1F2937" />}
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalHeading}>Select Language</Text>
            {getAvailableLanguages(selectingFor).map((lang) => (
              <TouchableOpacity key={lang} style={styles.option} onPress={() => selectLanguage(lang)}>
                <Text style={styles.optionText}>{lang}</Text>
                {(selectingFor === 'source' ? sourceLang : targetLang) === lang && (
                  <Ionicons name="checkmark-circle" size={20} color="#FBBF24" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={{ paddingVertical: 10 }} onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: 'center', color: '#9CA3AF', fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollBody: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 110 },
  
  // BAGONG HEADER SECTION
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#FFD700', // GINAWANG YELLOW
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  introContainer: { alignItems: 'center', flex: 1 },
  introTitle: { fontSize: 28, fontWeight: '900' },
  blackText: { color: '#1F2937' },
  yellowText: { color: '#FBBF24' },
  visionTag: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: '#9CA3AF', 
    letterSpacing: 2,
    marginTop: -2 
  },

  yellowSelector: {
    backgroundColor: '#FFD700',
    height: 65,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    elevation: 4,
  },
  langSide: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  langName: { fontSize: 17, fontWeight: '800', color: '#1F2937' },
  swapCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderWrapper: { alignItems: 'center' },
  viewfinder: {
    width: '100%',
    height: width * 0.75,
    backgroundColor: '#F9FAFB',
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: { flex: 1 },
  fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  scanLine: { position: 'absolute', width: '100%', height: 3, backgroundColor: '#FBBF24', zIndex: 10 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#D1D5DB', marginTop: 8, fontSize: 12, fontWeight: '700' },
  guide: { position: 'absolute', width: 25, height: 25, borderColor: '#FBBF24', borderWidth: 4 },
  tl: { top: 15, left: 15, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 10 },
  tr: { top: 15, right: 15, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 10 },
  bl: { bottom: 15, left: 15, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 10 },
  br: { bottom: 15, right: 15, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 10 },
  resultContainer: { marginTop: 15, padding: 15, backgroundColor: '#F9FAFB', borderRadius: 20 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  resultTag: { fontSize: 9, fontWeight: '900', color: '#9CA3AF' },
  resultText: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  footer: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' },
  captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', elevation: 6 },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFD700', borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  modalHandle: { width: 35, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  modalHeading: { fontSize: 17, fontWeight: '900', color: '#1F2937', textAlign: 'center', marginBottom: 15 },
  option: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  optionText: { fontSize: 15, fontWeight: '700', color: '#4B5563' }
});