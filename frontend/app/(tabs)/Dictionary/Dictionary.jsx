import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Alert, Image,  Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router'; 
import NetInfo from '@react-native-community/netinfo';

import BottomNav from '../../../shared/components/BottomNav';
import TopBar from '../../../shared/components/TopBar';
import DictionaryFilters from '../../../shared/components/DictionaryFilters';
import RefreshContainer from '../../../shared/components/RefreshContainer'; // ✅ IMPORT REUSABLE REFRESH CONTAINER
import { useDictionaryBrowse } from '../../../shared/hooks/useDictionaryBrowse';
import { useOfflineSearch } from '../../../shared/hooks/useOfflineSearch';
import FeatureGateModal from '../../../shared/components/FeatureGateModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../../shared/styles/DictionaryStyles';
import { supabase } from '../../../shared/lib/supabase';
import { endpoints } from '../../../shared/config/apiConfig';

const API_BASE_URL = endpoints.DICTIONARY_SEARCH;   

export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // ✅ STATE FOR PULL-TO-REFRESH
  const [error, setError] = useState(null);
  const router = useRouter(); 
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  
  // Destructured `refreshBrowseData` from your browse hook if it supports manual re-fetches
  const { browseData, isFetchingMore, handleLoadMore, filters, refreshBrowseData } = useDictionaryBrowse(searchQuery);
  const {
    isOffline,
    offlineResults,
    offlineBrowseData
  } = useOfflineSearch(searchQuery, isGuestMode);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      if (!connected) {
        setIsGuestMode(true);
      } else {
        checkGuestMode(); 
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    checkGuestMode();
  }, []);

  const checkGuestMode = async () => {
    const { data: { session } } = await supabase.auth.getSession();

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert("Authentication Required", "Please log in to search.");
        setLoading(false);
        return;
      }

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
      }
    } catch (err) {
      console.error("Search Error:", err);
      setError("Could not connect to the server.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ PULL-TO-REFRESH HANDLER
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      await checkGuestMode();
      
      if (searchQuery.trim() && !isGuestMode && isConnected) {
        await handleSearch(searchQuery.trim());
      } else if (refreshBrowseData) {
        await refreshBrowseData();
      }
    } catch (err) {
      console.error("Refresh failure:", err);
    } finally {
      setRefreshing(false);
    }
  }, [searchQuery, isGuestMode, isConnected, refreshBrowseData]);

  // ✅ INFINITE SCROLL EVENT MONITOR FOR SCROLLVIEW MATCHING
  const handleScroll = ({ nativeEvent }) => {
    if (isOffline || isFetchingMore || !handleLoadMore) return;

    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

    if (isCloseToBottom) {
      handleLoadMore();
    }
  };

  const displayData =
    !isConnected
      ? (searchQuery.trim() ? offlineResults : offlineBrowseData)
      : isGuestMode
        ? (searchQuery.trim() ? offlineResults : offlineBrowseData)
        : (searchQuery.trim() ? searchResults : browseData);

  const renderItem = (item, index) => {
    const translations = item.translations || [];
    const trans1 = translations[0]?.target_entry?.word_term || '';
    const trans2 = translations[1]?.target_entry?.word_term || '';
    const usage1 = translations[0]?.target_entry?.example_usage || '';
    const usage2 = translations[1]?.target_entry?.example_usage || '';
    const translationDisplay = [trans1, trans2].filter(Boolean).join(' / ') || 'No translation';
    const def1 = translations[0]?.target_entry?.definition || '';
    const def2 = translations[1]?.target_entry?.definition || '';
    return (
      <TouchableOpacity 
        key={item.id?.toString() || index.toString()}
        activeOpacity={0.7} 
        style={styles.entryCard} 
        onPress={() => {
          router.push({
            pathname: '/Dictionary/ResultDictionary', 
            params: { 
              id: item.id,
              wordTerm: item.word_term || '',
              languageId: item.language_id,
              definition: item.definition || '',
              partOfSpeech: item.part_of_speech || 'Word',
              exampleUsage: item.example_usage || '', 
              phoneticTranscription: item.phonetic_transcription || '',
              translation1: trans1,
              translation2: trans2,
              translationDef1: def1,
              translationDef2: def2,
              usage1: usage1,
              usage2: usage2
            }
          });
        }} 
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.entryWord}>{item.word_term}</Text>
          <Text style={styles.entryTranslation}>{translationDisplay}</Text>
          {def1 ? (
            <Text style={{ fontSize: 12, color: '#78909C', marginTop: 4 }} numberOfLines={1}>
              Def: {def1}
            </Text>
          ) : null}
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
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <TopBar onMenuPress={() => console.log("Menu Pressed!")} />

      {isGuestMode && (
        <View style={{ backgroundColor: '#421C00', padding: 5, alignItems: 'center' }}>
          <Text style={{ color: '#FFD54F', fontSize: 11, fontWeight: 'bold' }}>
            GUEST MODE: OFFLINE DICTIONARY ENABLED
          </Text>
        </View>
      )}

      {/* ✅ REFRESH CONTAINER WRAPPING THE BODY CONTENT AT THE TOP LEVEL */}
      <RefreshContainer
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Evaluates scroll calculations smoothly
      >
        <View style={{ flex: 1 }}>
          {/* Header section */}
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
              placeholder={isGuestMode ? "Search offline dictionary..." : "Search words..."}
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
              <ActivityIndicator size="large" color="#FFD54F" />
            </View>
          )}

          {/* Empty Results State */}
          {!loading && searchQuery.trim() && displayData.length === 0 && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
              <Text style={{ fontSize: 14, color: '#999', textAlign: 'center' }}>
                No results found for "{searchQuery}"
              </Text>
            </View>
          )}

          {/* ✅ RENDER ITEMS DIRECTLY WITHOUT NESTED FLATLIST PERFORMANCE WARNINGS */}
          {!loading && displayData.length > 0 && (
            <View style={styles.listContent}>
              {displayData.map((item, index) => renderItem(item, index))}
            </View>
          )}

          {/* Loading More Footer Component Indicator */}
          {isFetchingMore && !isOffline && (
            <ActivityIndicator color="#FFD54F" style={{ marginVertical: 15 }} />
          )}
        </View>
      </RefreshContainer>

      <FeatureGateModal visible={showFeatureModal} onClose={() => setShowFeatureModal(false)} />
      <BottomNav activeTab="Dictionary" />
    </SafeAreaView>
  );
}