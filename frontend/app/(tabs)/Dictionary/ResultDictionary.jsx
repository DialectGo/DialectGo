import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import BottomNav from '../../../shared/components/BottomNav';
import { styles } from '../../../shared/styles/ResultDictionaryStyles';

export default function ResultDictionary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isBookmarked, setIsBookmarked] = useState(false);

  let parsedExamples = [];
  try {
    parsedExamples = params.examples ? JSON.parse(params.examples) : [];
  } catch (e) {
    parsedExamples = [];
  }

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

        {/* Center: Title - Inalis ang flex para hindi sumakop ng space sa kanan */}
        <Text style={[styles.topLabel, { flex: 0, marginHorizontal: 10 }]}>DICTIONARY</Text>

        {/* Right Side: History & Saved Words Icons */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.backCircle, { marginLeft: 8 }]} 
            onPress={() => {
              console.log("Navigating to History...");
              // SIGURADUHIN na tama ang path: Folder/FileName
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
            onPress={() => setIsBookmarked(!isBookmarked)}
          >
            <Image 
              source={require('../../../assets/icons/star.png')} 
              style={[styles.starIcon, { tintColor: isBookmarked ? '#421C00' : '#FFFFFF' }]} 
            />
            <Text style={styles.bookmarkText}>{isBookmarked ? 'Saved' : 'Save Word'}</Text>
          </TouchableOpacity>

          <Text style={styles.displayWord}>{params.cebuano || 'No Word'}</Text>
          <Text style={styles.syllableText}>[ {params.pos || 'Word'} ]</Text>
        </View>

        {/* TRANSLATIONS SECTION */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>TRANSLATIONS</Text>
          <View style={styles.descriptionBox}>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontFamily: 'Poppins-Bold', color: '#FFD54F', fontSize: 12 }}>ENGLISH</Text>
              <Text style={styles.descriptionText}>{params.english}</Text>
            </View>
            <View>
              <Text style={{ fontFamily: 'Poppins-Bold', color: '#FFD54F', fontSize: 12 }}>TAGALOG</Text>
              <Text style={styles.descriptionText}>{params.tagalog}</Text>
            </View>
          </View>
        </View>

        {/* USAGE SECTION */}
        {parsedExamples.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>USAGE IN SENTENCES</Text>
            {parsedExamples.map((ex, index) => (
              <View key={index} style={styles.usageCard}>
                <Text style={styles.exampleText}>• {ex.cebuano}</Text>
                <Text style={[styles.exampleText, { color: '#8E8E8E', fontSize: 13 }]}>{ex.english}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNav activeTab="Dictionary" />
    </SafeAreaView>
  );
}