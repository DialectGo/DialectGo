import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router'; 

import BottomNav from '../../../shared/components/BottomNav';
import TopBar from '../../../shared/components/TopBar';
import { styles } from '../../../shared/styles/DictionaryStyles';
import { supabase } from '../../../shared/lib/supabase';

const API_BASE_URL = 'http://192.168.1.52:5001/api/dictionary/search';

export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter(); 
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Search with debounce
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Debounce search to avoid too many API calls
    const timeout = setTimeout(() => {
      handleSearch(searchQuery.trim());
    }, 500);

    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSearch = async (term) => {
    setLoading(true);
    setError(null);
    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert("Authentication Required", "Please log in to search.");
        setLoading(false);
        return;
      }

      // Fetch from backend
      const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(term)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success && result.data) {
        setSearchResults([result.data]);
      } else {
        setSearchResults([]);
        // setError(result.message || 'Word not found');
      }
    } catch (err) {
      console.error("Search Error:", err);
      setError("Could not connect to the server.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = searchResults;

  const renderItem = ({ item }) => {
    // Extract first 2 translations
    const translations = item.translations || [];
    const trans1 = translations[0]?.target_entry?.word_term || '';
    const trans2 = translations[1]?.target_entry?.word_term || '';
    const usage1 = translations[0]?.target_entry?.example_usage || '';
    const usage2 = translations[1]?.target_entry?.example_usage || '';
    const translationDisplay = [trans1, trans2].filter(Boolean).join(' / ') || 'No translation';

    return (
      <TouchableOpacity 
        activeOpacity={0.7} 
        style={styles.entryCard} 
        onPress={() => {
          router.push({
            pathname: '/Dictionary/ResultDictionary', 
            params: { 
              id: item.id,
              wordTerm: item.word_term || '',
              definition: item.definition || '',
              partOfSpeech: item.part_of_speech || 'Word',
              exampleUsage: item.example_usage || '', 
              phoneticTranscription: item.phonetic_transcription || '',
              translation1: trans1,
              translation2: trans2,
              usage1: usage1, // Matched
              usage2: usage2  // Matched
            }
          });
        }} 
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.entryWord}>{item.word_term}</Text>
          <Text style={styles.entryTranslation}>{translationDisplay}</Text>
        </View>

        {item.part_of_speech && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{item.part_of_speech.toUpperCase()}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar onMenuPress={() => console.log("Menu Pressed!")} />

      <View style={{ flex: 1 }}>
        {/* Header section na hindi dikit sa taas */}
        <View style={[styles.header, { marginTop: 10 }]}>
          <View>
            <Text style={styles.headerTitleYellow}>DialectGo</Text>
            <Text style={styles.headerTitleBlack}>Dictionary</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
            style={styles.iconCircle}
            onPress={() => router.push('/Dictionary/History')}
            >
              <Image source={require('../../../assets/images/history.png')} style={styles.topIcon} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconCircle}
              onPress={() => router.push('/Dictionary/SaveWords')}
            >
              <Image source={require('../../../assets/icons/star.png')} style={styles.topIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search words..."
            placeholderTextColor="#421C00"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {loading ? (
            <ActivityIndicator size="small" color="#FFD54F" style={{ marginRight: 10 }} />
          ) : (
            <Image source={require('../../../assets/images/search.png')} style={styles.searchIcon} />
          )}
        </View>

        {/* Error Message */}
        {error && !loading && (
          <View style={{ padding: 10, backgroundColor: '#FFE0E0', marginHorizontal: 10, borderRadius: 8 }}>
            <Text style={{ color: '#C00', fontSize: 12 }}>{error}</Text>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FFD54F" />
          </View>
        )}

        {/* Results or Empty State */}
        {!loading && searchResults.length === 0 && searchQuery.trim() && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#999', textAlign: 'center' }}>
              No results found for "{searchQuery}"
            </Text>
          </View>
        )}

        {/* FlatList with Results */}
        {!loading && (
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <BottomNav activeTab="Dictionary" />
    </SafeAreaView>
  );
}