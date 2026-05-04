import React, { useState, useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import BottomNav from '../../../shared/components/BottomNav';
import { styles } from '../../../shared/styles/ResultDictionaryStyles';

export default function ResultDictionary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState(params.cebuano || "");

  let parsedExamples = [];
  let parsedPronunciation = {};

  try {
    parsedExamples = params.examples ? JSON.parse(params.examples) : [];
    parsedPronunciation = params.pronunciation ? JSON.parse(params.pronunciation) : {};
  } catch (e) {
    console.error("Error parsing JSON params:", e);
  }

  useEffect(() => {
    if (params.cebuano) {
      saveToHistory();
      checkIfBookmarked();
    }
  }, [params.cebuano]);

  const saveToHistory = async () => {
    try {
      const existingData = await AsyncStorage.getItem('history_list');
      let history = existingData ? JSON.parse(existingData) : [];
      const newItem = {
        cebuano: params.cebuano,
        tagalog: params.tagalog,
        english: params.english,
        pos: params.pos,
        pronunciation: parsedPronunciation,
        examples: parsedExamples,
        timestamp: new Date().getTime(),
      };
      history = history.filter(item => item.cebuano !== newItem.cebuano);
      history.unshift(newItem);
      if (history.length > 50) history.pop();
      await AsyncStorage.setItem('history_list', JSON.stringify(history));
    } catch (e) { console.error(e); }
  };

  const checkIfBookmarked = async () => {
    try {
      const data = await AsyncStorage.getItem('bookmarks_list');
      if (data) {
        const bookmarks = JSON.parse(data);
        setIsBookmarked(bookmarks.some(item => item.cebuano === params.cebuano));
      }
    } catch (e) { console.error(e); }
  };

  const toggleBookmark = async () => {
    try {
      const data = await AsyncStorage.getItem('bookmarks_list');
      let bookmarks = data ? JSON.parse(data) : [];
      if (isBookmarked) {
        bookmarks = bookmarks.filter(item => item.cebuano !== params.cebuano);
      } else {
        bookmarks.unshift({ ...params, pronunciation: parsedPronunciation, examples: parsedExamples });
      }
      await AsyncStorage.setItem('bookmarks_list', JSON.stringify(bookmarks));
      setIsBookmarked(!isBookmarked);
    } catch (e) { console.error(e); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnNoBg}>
            <Image 
              source={require('../../../assets/icons/back_arrow.png')} 
              style={styles.backImgLarge} 
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.brandYellow}>DialectGo</Text>
            <Text style={styles.brandBlack}>Dictionary</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
           <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('/Dictionary/History')}>
              <Image source={require('../../../assets/images/history.png')} style={styles.topIcon} />
           </TouchableOpacity>
           <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('/Dictionary/SaveWords')}>
              <Image source={require('../../../assets/images/star.png')} style={styles.topIcon} />
           </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput} 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search..."
          />
          <Image source={require('../../../assets/images/search.png')} style={styles.searchIcon} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        <View style={styles.mainWordCard}>
          <Text style={styles.heroWord}>{params.cebuano || '---'}</Text>
          <Text style={styles.heroPronounce}>{parsedPronunciation.cebuano || 'un-sa'}</Text>
        </View>

        <View style={styles.definitionsRow}>
          <View style={styles.defColumn}>
            <Text style={styles.posLabel}>(pronoun)</Text>
            <View style={styles.defBox}>
              <Text style={styles.defHeader}>Definition</Text>
              <Text style={styles.defText}>{params.english || 'what'}</Text>
            </View>
          </View>

          <View style={styles.defColumn}>
            <Text style={styles.posLabel}>(noun)</Text>
            <View style={styles.defBox}>
              <Text style={styles.defHeader}>Definition</Text>
              <Text style={styles.defText}>{params.tagalog || 'ano'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.exampleSection}>
          <Text style={styles.exampleTitle}>Example:</Text>
          <View style={styles.exampleContent}>
            <Text style={styles.exampleLine}><Text style={styles.boldLabel}>Cebuano: </Text>{parsedExamples[0]?.cebuano || 'Unsay ngalan mo?'}</Text>
            <Text style={styles.exampleLine}><Text style={styles.boldLabel}>Tagalog: </Text>{parsedExamples[0]?.tagalog || 'Ano ang pangalan mo?'}</Text>
            <Text style={styles.exampleLine}><Text style={styles.boldLabel}>English: </Text>{parsedExamples[0]?.english || 'What is your name?'}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.floatingSaveBtn, isBookmarked && styles.activeSaveBtn]}
        onPress={toggleBookmark}
      >
        <Image 
          source={require('../../../assets/icons/star.png')} 
          style={[styles.starIcon, { tintColor: isBookmarked ? '#FFD54F' : '#FFFFFF' }]} 
        />
        <Text style={[styles.bookmarkText, { color: isBookmarked ? '#FFD54F' : '#FFFFFF' }]}>
          {isBookmarked ? 'SAVED' : 'SAVE WORD'}
        </Text>
      </TouchableOpacity>

      <BottomNav activeTab="Dictionary" />
    </SafeAreaView>
  );
}