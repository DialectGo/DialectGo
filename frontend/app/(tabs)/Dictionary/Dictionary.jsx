import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router'; 
import NetInfo from '@react-native-community/netinfo';

import BottomNav from '../../../shared/components/BottomNav';
import TopBar from '../../../shared/components/TopBar';
import DictionaryFilters from '../../../shared/components/DictionaryFilters';
import { useDictionaryBrowse } from '../../../shared/hooks/useDictionaryBrowse';
import { useOfflineSearch } from '../../../shared/hooks/useOfflineSearch';
import FeatureGateModal from '../../../shared/components/FeatureGateModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthMode } from '../../../shared/utils/authMode';
import { styles } from '../../../shared/styles/DictionaryStyles';
import { supabase } from '../../../shared/lib/supabase';

const API_BASE_URL = 'http://192.168.1.53:5001/api/dictionary/search';

export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter(); 
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const { browseData, isFetchingMore, handleLoadMore, filters } = useDictionaryBrowse(searchQuery);
  const {
    isOffline,
    offlineResults,
    offlineBrowseData
  } = useOfflineSearch(searchQuery, isGuestMode);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      // FORCE guest mode when offline
      if (!connected) {
        setIsGuestMode(true);
      } else {
        checkGuestMode(); // re-evaluate when back online
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
      checkGuestMode();
    }, []);

    const checkGuestMode = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // If there is an active user session, they are definitely NOT a guest
      if (session) {
        setIsGuestMode(false);
        return;
      }

      const role = await AsyncStorage.getItem('@user_role');
      const guestMode = await AsyncStorage.getItem('@guest_mode');

      const isGuest = role === 'guest' || guestMode !== null;
      setIsGuestMode(isGuest);
    };
  // Search with debounce
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);

    // FORCE guest mode if offline
    if (!isConnected) {
      setIsGuestMode(true);
    }

    if (isGuestMode) {
      setSearchResults([]);
      return;
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      handleSearch(searchQuery.trim());
    }, 500);

    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [searchQuery, isGuestMode, isConnected]);

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

      if (result.success && Array.isArray(result.data)) {
        setSearchResults(result.data); 
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

  const displayData =
  !isConnected
    ? (searchQuery.trim() ? offlineResults : offlineBrowseData)
    : isGuestMode
      ? (searchQuery.trim() ? offlineResults : offlineBrowseData)
      : (searchQuery.trim() ? searchResults : browseData);

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

      {isGuestMode && (
        <View style={{ backgroundColor: '#421C00', padding: 5, alignItems: 'center' }}>
          <Text style={{ color: '#FFD54F', fontSize: 11, fontWeight: 'bold' }}>
            GUEST MODE: OFFLINE DICTIONARY ENABLED
          </Text>
        </View>
      )}

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
            onPress={() => {
                if (isGuestMode) {
                  setShowFeatureModal(true);
                  return;
                }

                router.push('/Dictionary/History');
              }}
            >
              <Image source={require('../../../assets/images/history.png')} style={styles.topIcon} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconCircle}
              onPress={() => {
                if (isGuestMode) {
                  setShowFeatureModal(true);
                  return;
                }

                router.push('/Dictionary/SaveWords');
              }}
            >
              <Image source={require('../../../assets/icons/star.png')} style={styles.topIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={
              isGuestMode
                ? "Search offline dictionary..."
                : "Search words..."
            }
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
        {!searchQuery.trim() && !isGuestMode && (
          <DictionaryFilters {...filters} />
        )}

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
        {!loading && searchQuery.trim() && displayData.length === 0 && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#999', textAlign: 'center' }}>
              No results found for "{searchQuery}"
            </Text>
          </View>
        )}

        {!loading && (
          <FlatList
            data={displayData} // Use the combined variable here
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderItem}
            onEndReached={!isOffline ? handleLoadMore : null}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={isFetchingMore && !isOffline ? <ActivityIndicator color="#FFD54F" /> : null}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <FeatureGateModal
        visible={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
      />
      <BottomNav activeTab="Dictionary" />
    </SafeAreaView>
  );
}