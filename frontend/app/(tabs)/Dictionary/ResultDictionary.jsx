import React, { useState, useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../../shared/lib/supabase';
import BottomNav from '../../../shared/components/BottomNav';
import { styles } from '../../../shared/styles/ResultDictionaryStyles';
import FeatureGateModal from '../../../shared/components/FeatureGateModal';
import { getAuthMode } from '../../../shared/utils/authMode';

const SAVE_API_URL = 'http://192.168.1.53:5001/api/dictionary/save';

export default function ResultDictionary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  useEffect(() => {
  checkGuestMode();
  }, []);

  const checkGuestMode = async () => {
    const { data: { session } } = await getAuthMode()

    setIsGuestMode(!session);
  };

  // Destructure all parameters including the new usage params
  const { 
    id, wordTerm, partOfSpeech, definition, 
    exampleUsage, phoneticTranscription, 
    translation1, translation2, 
    usage1, usage2 
  } = params;

  const handleSaveWord = async () => {
    if (!id) {
      Alert.alert("Error", "ID is missing.");
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
      
      {/* FIXED UI HEADER: Back button and Title both aligned to the LEFT */}
      <View style={[styles.topHeader, { 
        flexDirection: 'row', 
        justifyContent: 'flex-start', // Align to left
        alignItems: 'center', 
        paddingHorizontal: 20,
        gap: 15 // Space between arrow and text
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
          <Text style={styles.heroPronounce}>
             {phoneticTranscription ? `//${phoneticTranscription}//` : `[ ${partOfSpeech} ]`}
          </Text>
        </View>

        {/* TRANSLATION BOXES */}
        <View style={styles.definitionsRow}>
          <View style={styles.defColumn}>
            <Text style={styles.posLabel}>(Translation 1)</Text>
            <View style={styles.defBox}>
              <Text style={styles.defHeader}>{translation1 || '---'}</Text>
              <Text style={styles.defText}>Equivalent term</Text>
            </View>
          </View>

          <View style={styles.defColumn}>
            <Text style={styles.posLabel}>(Translation 2)</Text>
            <View style={styles.defBox}>
              <Text style={styles.defHeader}>{translation2 || '---'}</Text>
              <Text style={styles.defText}>Equivalent term</Text>
            </View>
          </View>
        </View>

        {/* USAGE EXAMPLES SECTION */}
        <View style={[styles.exampleSection, { marginTop: 20 }]}>
          <Text style={[styles.exampleTitle, { fontSize: 18, fontWeight: 'bold', color: '#421C00' }]}>Usage Examples:</Text>
          <View style={styles.exampleContent}>
            
            {/* Main Word Example */}
            <View style={{ marginBottom: 12 }}>
                <Text style={[styles.boldLabel, { marginBottom: 2 }]}>{wordTerm}:</Text>
                <Text style={styles.exampleLine}>{exampleUsage || 'No example available.'}</Text>
            </View>
            
            {/* Translation 1 Example */}
            {translation1 ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.boldLabel, { marginBottom: 2 }]}>{translation1}:</Text>
                <Text style={styles.exampleLine}>{usage1 || 'No example available.'}</Text>
              </View>
            ) : null}

            {/* Translation 2 Example */}
            {translation2 ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.boldLabel, { marginBottom: 2 }]}>{translation2}:</Text>
                <Text style={styles.exampleLine}>{usage2 || 'No example available.'}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* SAVE WORD BUTTON CONTAINER */}
      <View style={{ paddingBottom: 20, alignItems: 'center' }}>
          <TouchableOpacity 
            style={[styles.floatingSaveBtn, isBookmarked && styles.activeSaveBtn]} 
            onPress={() => {
              if (isGuestMode) {
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
                    <Image 
                        source={require('../../../assets/icons/star.png')} 
                        style={[styles.starIcon, { tintColor: '#FFFFFF' }]} 
                    />
                    <Text style={styles.bookmarkText}>
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

      <BottomNav activeTab="Dictionary" />
    </SafeAreaView>
  );
}