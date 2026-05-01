import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../shared/lib/supabase';

const SAVED_WORDS_API = 'http://192.168.1.52:5001/api/dictionary/saved';

export default function SaveWords() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load bookmarks tuwing papasok sa screen
  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      // 1. Get the current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // console.error("No active session found");
        // Alert.alert("Authentication Required", "Please log in to view saved words.");
        setLoading(false);
        return;
      }

      // 2. Fetch from your backend API
      const response = await fetch(SAVED_WORDS_API, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success && result.data && result.data.data) {
        // Based on your backend structure, the word data is likely nested in 'entry'
        setBookmarks(result.data.data);
      } 
      else {
        setBookmarks([]);
      }
    } catch (error) {
      console.error("Error loading bookmarks from API:", error);
    } finally {
      setLoading(false);
    }
  };
  const renderItem = ({ item }) => {
    // Accessing the nested dictionary entry from the saved_words join
    const entry = item.entry || {};
    
    // Extract translations for display
    const translations = entry.translations || [];
    const trans1 = translations[0]?.target_entry?.word_term || '';
    const trans2 = translations[1]?.target_entry?.word_term || '';
    const translationDisplay = [trans1, trans2].filter(Boolean).join(' / ') || 'No translation';

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        style={styles.card} 
        onPress={() => {
          router.push({
            pathname: '/Dictionary/ResultDictionary',
            params: {
              id: entry.id,
              wordTerm: entry.word_term,
              definition: entry.definition,
              partOfSpeech: entry.part_of_speech,
              phoneticTranscription: entry.phonetic_transcription,
              exampleUsage: entry.example_usage,
              translation1: trans1,
              translation2: trans2
            }
          });
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.wordText}>{entry.word_term}</Text>
          <Text style={styles.translationText}>{translationDisplay}</Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.posTag}>{entry.part_of_speech?.toUpperCase() || 'WORD'}</Text>
          <Image 
            source={require('../../../assets/icons/star.png')} 
            style={styles.starIcon} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image source={require('../../../assets/icons/back_arrow.png')} style={styles.backImg} />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Words</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* LIST SECTION */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FFD54F" />
        </View>
      ) : bookmarks.length > 0 ? (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image source={require('../../../assets/icons/star.png')} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No saved words yet.</Text>
          <Text style={styles.emptySubText}>
            Tap the star icon on any word in the dictionary to save it here.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFDF5' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center' 
  },
  backButton: {
    padding: 8,
  },
  backImg: { 
    width: 24, 
    height: 24,
    tintColor: '#421C00'
  },
  title: { 
    fontSize: 22, 
    fontFamily: 'Poppins-Bold', 
    color: '#421C00' 
  },
  listContainer: { 
    paddingHorizontal: 25, 
    paddingTop: 10,
    paddingBottom: 40 
  },
  card: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  wordText: { 
    fontSize: 18, 
    fontFamily: 'Poppins-Bold', 
    color: '#421C00' 
  },
  translationText: { 
    fontSize: 13, 
    fontFamily: 'Poppins-Regular',
    color: '#8E8E8E', 
    marginTop: 2 
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  posTag: {
    fontSize: 9,
    color: '#FFB800',
    fontFamily: 'Poppins-Bold',
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  starIcon: { 
    width: 18, 
    height: 18, 
    tintColor: '#FFD54F' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },
  emptyIcon: {
    width: 60,
    height: 60,
    tintColor: '#E0E0E0',
    marginBottom: 15
  },
  emptyText: { 
    fontSize: 18, 
    fontFamily: 'Poppins-Bold', 
    color: '#421C00' 
  },
  emptySubText: {
    textAlign: 'center',
    color: '#ADB5BD',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
    lineHeight: 20
  }
});