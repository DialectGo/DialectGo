import React, { useState } from 'react';
// Added Alert and ActivityIndicator to react-native imports
import { 
  Image, 
  SafeAreaView, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Import AsyncStorage (Ensure you have @react-native-async-storage/async-storage installed)
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { supabase } from '../../../shared/lib/supabase';

import BottomNav from '../../../shared/components/BottomNav';
import { styles } from '../../../shared/styles/ResultDictionaryStyles';

const SAVE_API_URL = 'http://192.168.1.52:5001/api/dictionary/save';

export default function ResultDictionary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Extract backend data
  const dictionaryId = params.id; 
  const wordTerm = params.wordTerm || 'No Word';
  const partOfSpeech = params.partOfSpeech || 'Word';
  const definition = params.definition || 'No definition available';
  const exampleUsage = params.exampleUsage || 'No examples available';
  const phoneticTranscription = params.phoneticTranscription || '';
  const translation1 = params.translation1 || '';
  const translation2 = params.translation2 || '';

  const handleSaveWord = async () => {
    if (!dictionaryId) {
      Alert.alert("Error", "Cannot save this word: ID is missing.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Get the JWT token from storage
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        Alert.alert("Error", "You must be logged in to save words.");
        return;
      }
      
      // 2. Perform the POST request to backend
      const response = await fetch(SAVE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          dictionary_id: parseInt(dictionaryId)
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsBookmarked(true);
        Alert.alert("Success", `"${wordTerm}" has been saved.`);
      } else {
        throw new Error(result.message || "Failed to save word.");
      }
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { flex: 1 }]}>
      
      {/* --- HEADER SECTION --- */}
      <View style={[styles.headerAction, { zIndex: 100 }]}>
        {/* Left Side: Back Button */}
        <TouchableOpacity 
          style={styles.backCircle} 
          onPress={() => router.back()}
        >
          <Image source={require('../../../assets/icons/back_arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>

        {/* Center: Title */}
        <Text style={[styles.topLabel, { flex: 0, marginHorizontal: 10 }]}>DICTIONARY</Text>

        {/* Right Side: History & Saved Words Icons */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.backCircle, { marginLeft: 8 }]} 
            onPress={() => {
              console.log("Navigating to History...");
              router.push('/Dictionary/History'); 
            }}
          >
            <Image 
              source={require('../../../assets/images/history.png')} 
              style={{ width: 20, height: 20, tintColor: '#421C00' }} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.backCircle, { marginLeft: 8 }]} 
            onPress={() => router.push('/Dictionary/SaveWords')}
          >
            <Image 
              source={require('../../../assets/icons/star.png')} 
              style={{ width: 20, height: 20, tintColor: '#421C00' }} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HERO CARD */}
        <View style={styles.yellowHeroCard}>
          <TouchableOpacity 
            style={styles.bookmarkBadge} 
            onPress={handleSaveWord}
            disabled={isSaving || isBookmarked}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#421C00" />
            ) : (
              <>
                <Image 
                  source={require('../../../assets/icons/star.png')} 
                  style={[styles.starIcon, { tintColor: isBookmarked ? '#421C00' : '#FFFFFF' }]} 
                />
                <Text style={styles.bookmarkText}>{isBookmarked ? 'Saved' : 'Save Word'}</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.displayWord}>{wordTerm}</Text>
          <Text style={styles.syllableText}>[ {partOfSpeech} ]</Text>
          {phoneticTranscription && (
            <Text style={[styles.syllableText, { marginTop: 5, fontSize: 12 }]}>
              /{phoneticTranscription}/
            </Text>
          )}
        </View>

        {/* TRANSLATIONS SECTION */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>TRANSLATIONS</Text>
          <View style={styles.descriptionBox}>
            {translation1 && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontFamily: 'Poppins-Bold', color: '#FFD54F', fontSize: 12 }}>TRANSLATION 1</Text>
                <Text style={styles.descriptionText}>{translation1}</Text>
              </View>
            )}
            {translation2 && (
              <View>
                <Text style={{ fontFamily: 'Poppins-Bold', color: '#FFD54F', fontSize: 12 }}>TRANSLATION 2</Text>
                <Text style={styles.descriptionText}>{translation2}</Text>
              </View>
            )}
            {!translation1 && !translation2 && (
              <Text style={[styles.descriptionText, { color: '#999' }]}>No translations available</Text>
            )}
          </View>
        </View>

        {/* DEFINITION SECTION */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>DEFINITION</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{definition}</Text>
          </View>
        </View>

        {/* USAGE SECTION */}
        {exampleUsage && exampleUsage !== 'No examples available' && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>USAGE IN SENTENCES</Text>
            <View style={styles.usageCard}>
              <Text style={styles.exampleText}>• {exampleUsage}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNav activeTab="Dictionary" />
    </SafeAreaView>
  );
}