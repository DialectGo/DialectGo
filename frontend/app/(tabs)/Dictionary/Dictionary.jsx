import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';

import BottomNav from '../../../src/components/BottomNav';
import TopBar from '../../../src/components/TopBar';
import DictionaryFilters from '../../../src/features/dictionary/components/DictionaryFilters';
import FeatureGateModal from '../../../src/shared/components/FeatureGateModal';

import { useDictionaryBrowse } from '../../../src/features/dictionary/hooks/useDictionaryBrowse';
import { useOfflineSearch } from '../../../src/features/dictionary/hooks/useOfflineSearch';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { styles } from '../../../src/features/dictionary/styles/DictionaryStyles';
import { supabase } from '../../../src/shared/api/supabase';
import { endpoints } from '../../../src/shared/api/client';

const API_BASE_URL = endpoints.DICTIONARY_SEARCH;

export default function Dictionary() {
  const { slide } = useLocalSearchParams();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ======================================================
  // SEARCH
  // ======================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [error, setError] = useState(null);


  // ======================================================
  // REFRESH
  // ======================================================

  const [refreshing, setRefreshing] = useState(false);


  // ======================================================
  // GUEST / NETWORK
  // ======================================================

  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [isConnected, setIsConnected] = useState(true);


  // ======================================================
  // DICTIONARY HOOKS
  // ======================================================

  const {
    browseData,
    isFetchingMore,
    handleLoadMore,
    filters,
    refreshBrowseData,
  } = useDictionaryBrowse(searchQuery);

  const {
    isOffline,
    offlineResults,
    offlineBrowseData,
  } = useOfflineSearch(
    searchQuery,
    isGuestMode
  );


  // ======================================================
  // NETWORK LISTENER
  // ======================================================

  useEffect(() => {

    const unsubscribe = NetInfo.addEventListener(
      state => {

        const connected =
          state.isConnected ?? false;

        setIsConnected(connected);

        if (!connected) {

          setIsGuestMode(true);

        } else {

          checkGuestMode();

        }

      }
    );

    return () => unsubscribe();

  }, []);


  // ======================================================
  // INITIAL GUEST MODE CHECK
  // ======================================================

  useEffect(() => {
    checkGuestMode();
  }, []);


  // ======================================================
  // CHECK GUEST MODE
  // ======================================================

  const checkGuestMode = async () => {

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();


      if (session) {

        setIsGuestMode(false);

        return;

      }


      const role =
        await AsyncStorage.getItem('@user_role');

      const guestMode =
        await AsyncStorage.getItem('@guest_mode');


      const isGuest =
        role === 'guest' ||
        guestMode !== null;


      setIsGuestMode(isGuest);

    } catch (error) {

      console.log(
        'Guest mode check error:',
        error
      );

      setIsGuestMode(true);

    }

  };


  // ======================================================
  // SEARCH WITH DEBOUNCE
  // ======================================================

  useEffect(() => {

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }


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

      handleSearch(
        searchQuery.trim()
      );

    }, 500);


    setSearchTimeout(timeout);


    return () => {

      clearTimeout(timeout);

    };

  }, [
    searchQuery,
    isGuestMode,
    isConnected,
  ]);


  // ======================================================
  // SEARCH API
  // ======================================================

  const handleSearch = async term => {

    setLoading(true);
    setError(null);


    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();


      if (!session) {

        Alert.alert(
          'Authentication Required',
          'Please log in to search.'
        );

        setLoading(false);

        return;

      }


      const response = await fetch(
        `${API_BASE_URL}/${encodeURIComponent(term)}`,
        {
          method: 'GET',

          headers: {
            Authorization:
              `Bearer ${session.access_token}`,

            'Content-Type':
              'application/json',
          },
        }
      );


      const result =
        await response.json();


      if (
        result.success &&
        Array.isArray(result.data)
      ) {

        setSearchResults(
          result.data
        );

      } else {

        setSearchResults([]);

      }

    } catch (err) {

      console.error(
        'Search Error:',
        err
      );

      setError(
        'Could not connect to the server.'
      );

      setSearchResults([]);

    } finally {

      setLoading(false);

    }

  };


  // ======================================================
  // PULL TO REFRESH
  // ======================================================

  const handleRefresh = useCallback(
    async () => {

      setRefreshing(true);
      setError(null);


      try {

        await checkGuestMode();


        if (
          searchQuery.trim() &&
          !isGuestMode &&
          isConnected
        ) {

          await handleSearch(
            searchQuery.trim()
          );

        } else if (
          refreshBrowseData
        ) {

          await refreshBrowseData();

        }

      } catch (err) {

        console.error(
          'Refresh failure:',
          err
        );

      } finally {

        setRefreshing(false);

      }

    },
    [
      searchQuery,
      isGuestMode,
      isConnected,
      refreshBrowseData,
    ]
  );


  // ======================================================
  // DISPLAY DATA
  // ======================================================

  const displayData =
    !isConnected
      ? (
          searchQuery.trim()
            ? offlineResults
            : offlineBrowseData
        )
      : isGuestMode
        ? (
            searchQuery.trim()
              ? offlineResults
              : offlineBrowseData
          )
        : (
            searchQuery.trim()
              ? searchResults
              : browseData
          );


  // ======================================================
  // RENDER DICTIONARY ITEM
  // ======================================================

  const renderItem = ({
    item,
    index,
  }) => {

    const translations =
      item.translations || [];


    const trans1 =
      translations[0]
        ?.target_entry
        ?.word_term || '';


    const trans2 =
      translations[1]
        ?.target_entry
        ?.word_term || '';


    const usage1 =
      translations[0]
        ?.target_entry
        ?.example_usage || '';


    const usage2 =
      translations[1]
        ?.target_entry
        ?.example_usage || '';


    const translationDisplay =
      [trans1, trans2]
        .filter(Boolean)
        .join(' / ') ||
      'No translation';


    const def1 =
      translations[0]
        ?.target_entry
        ?.definition || '';


    const def2 =
      translations[1]
        ?.target_entry
        ?.definition || '';


    return (

      <TouchableOpacity
        activeOpacity={0.7}

        style={styles.entryCard}

        onPress={() => {

          router.push({

            pathname:
              '/Dictionary/ResultDictionary',

            params: {

              id: item.id,

              wordTerm:
                item.word_term || '',

              languageId:
                item.language_id,

              definition:
                item.definition || '',

              partOfSpeech:
                item.part_of_speech ||
                'Word',

              exampleUsage:
                item.example_usage ||
                '',

              phoneticTranscription:
                item.phonetic_transcription ||
                '',

              translation1:
                trans1,

              translation2:
                trans2,

              translationDef1:
                def1,

              translationDef2:
                def2,

              usage1:
                usage1,

              usage2:
                usage2,

            },

          });

        }}
      >

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}
        >

          <Text
            style={styles.entryWord}
          >
            {item.word_term}
          </Text>


          <Text
            style={styles.entryTranslation}
          >
            {translationDisplay}
          </Text>


          {def1 ? (

            <Text
              style={{
                fontSize: 12,
                color: '#78909C',
                marginTop: 4,
              }}
              numberOfLines={1}
            >
              Def: {def1}
            </Text>

          ) : null}

        </View>


        {item.part_of_speech && (

          <View
            style={styles.tagContainer}
          >

            <Text
              style={styles.tagText}
            >
              {item.part_of_speech.toUpperCase()}
            </Text>

          </View>

        )}

      </TouchableOpacity>

    );

  };


  // ======================================================
  // KEY EXTRACTOR
  // ======================================================

  const keyExtractor = (
    item,
    index
  ) => {

    return item.id?.toString() ||
      index.toString();

  };


  // ======================================================
  // LOAD MORE
  // ======================================================

  const handleEndReached = () => {

    if (
      isOffline ||
      isFetchingMore ||
      !handleLoadMore
    ) {

      return;

    }


    if (
      !searchQuery.trim() &&
      !isGuestMode
    ) {

      handleLoadMore();

    }

  };


  // ======================================================
  // EMPTY / LOADING COMPONENT
  // ======================================================

  const renderListEmpty = () => {

    // ----------------------------------------------
    // SEARCH LOADING
    // ----------------------------------------------

    if (loading) {

      return (

        <View
          style={styles.emptyContainer}
        >

          <ActivityIndicator
            size="large"
            color="#FFD54F"
          />

        </View>

      );

    }


    // ----------------------------------------------
    // ERROR
    // ----------------------------------------------

    if (
      error &&
      !loading
    ) {

      return (

        <View
          style={[
            styles.emptyContainer,
            {
              paddingHorizontal: 20,
            },
          ]}
        >

          <View
            style={{
              padding: 10,
              backgroundColor: '#FFE0E0',
              borderRadius: 8,
              width: '100%',
            }}
          >

            <Text
              style={{
                color: '#C00',
                fontSize: 12,
              }}
            >
              {error}
            </Text>

          </View>

        </View>

      );

    }


    // ----------------------------------------------
    // NO SEARCH RESULTS
    // ----------------------------------------------

    if (
      searchQuery.trim() &&
      displayData.length === 0
    ) {

      return (

        <View
          style={styles.emptyContainer}
        >

          <Text
            style={{
              fontSize: 14,
              color: '#999',
              textAlign: 'center',
            }}
          >
            No results found for "{searchQuery}"
          </Text>

        </View>

      );

    }


    return null;

  };


  // ======================================================
  // FOOTER
  // ======================================================

  const renderFooter = () => {

    if (
      isFetchingMore &&
      !isOffline
    ) {

      return (

        <ActivityIndicator
          color="#FFD54F"
          style={{
            marginVertical: 15,
          }}
        />

      );

    }


    return null;

  };


  // ======================================================
  // MAIN UI
  // ======================================================

  return (

    <View
      style={styles.container}
    >

      {/* ==================================================
          SCREEN OPTIONS
      ================================================== */}

      <Stack.Screen
        options={{
          animation: 'fade',
        }}
      />


      {/* ==================================================
          TOP BAR
      ================================================== */}

      <TopBar

        titlePrimary="DialectGo"

        titleSecondary="Dictionary"

        screenType="dictionary"


        onHistoryPress={() => {

          if (isGuestMode) {

            setShowFeatureModal(true);

            return;

          }


          router.push(
            '/Dictionary/History'
          );

        }}


        onSaveWordsPress={() => {

          if (isGuestMode) {

            setShowFeatureModal(true);

            return;

          }


          router.push(
            '/Dictionary/SaveWords'
          );

        }}

      />


      {/* ==================================================
          GUEST MODE NOTICE
      ================================================== */}

      {isGuestMode && (

        <View
          style={{
            backgroundColor: '#421C00',
            padding: 5,
            alignItems: 'center',

            // Keep notice below TopBar
            marginTop: insets.top + 55,
          }}
        >

          <Text
            style={{
              color: '#FFD54F',
              fontSize: 11,
              fontWeight: 'bold',
            }}
          >
            GUEST MODE: OFFLINE DICTIONARY ENABLED
          </Text>

        </View>

      )}


      {/* ==================================================
          FIXED SEARCH + FILTER AREA
          ==================================================
          
          IMPORTANT:
          This is OUTSIDE the FlatList.

          Therefore:
          - Search stays visible
          - Filters stay visible
          - Only words scroll
      ================================================== */}

      <View
        style={[
          styles.contentWrapper,

          {
            marginTop:
              isGuestMode
                ? 8
                : insets.top + 65,

          },

        ]}
      >

        {/* ==================================================
            SEARCH BAR
        ================================================== */}

        <View
          style={styles.searchContainer}
        >

          <TextInput

            style={styles.searchInput}

            placeholder={
              isGuestMode
                ? 'Search offline dictionary...'
                : 'Search words...'
            }

            placeholderTextColor="#421C00"

            value={searchQuery}

            onChangeText={
              setSearchQuery
            }

          />


          {loading ? (

            <ActivityIndicator
              size="small"
              color="#421C00"
              style={{
                marginRight: 10,
              }}
            />

          ) : (

            <Image
              source={require(
                '../../../assets/images/search.png'
              )}

              style={
                styles.searchIcon
              }
            />

          )}

        </View>


        {/* ==================================================
            DICTIONARY FILTERS
        ================================================== */}

        {!searchQuery.trim() &&
          !isGuestMode && (

            <DictionaryFilters
              {...filters}
            />

          )}

      </View>


      {/* ==================================================
          WORD LIST
          ==================================================
          
          ONLY THIS PART SCROLLS.
      ================================================== */}

      <FlatList

        data={displayData}

        keyExtractor={
          keyExtractor
        }

        renderItem={
          renderItem
        }


        // ----------------------------------------------
        // PULL TO REFRESH
        // ----------------------------------------------

        refreshControl={

          <RefreshControl

            refreshing={
              refreshing
            }

            onRefresh={
              handleRefresh
            }

            tintColor="#421C00"

            colors={[
              '#FFD54F',
            ]}

          />

        }


        // ----------------------------------------------
        // INFINITE SCROLL
        // ----------------------------------------------

        onEndReached={
          handleEndReached
        }

        onEndReachedThreshold={0.4}


        // ----------------------------------------------
        // LIST SPACING
        // ----------------------------------------------

        contentContainerStyle={[
          styles.listContent,

          {
            paddingBottom:
              120,
          },

          displayData.length === 0 && {
            flexGrow: 1,
          },

        ]}


        showsVerticalScrollIndicator={false}


        // ----------------------------------------------
        // EMPTY STATE
        // ----------------------------------------------

        ListEmptyComponent={
          renderListEmpty
        }


        // ----------------------------------------------
        // LOADING MORE
        // ----------------------------------------------

        ListFooterComponent={
          renderFooter
        }


        // ----------------------------------------------
        // PERFORMANCE
        // ----------------------------------------------

        keyboardShouldPersistTaps="handled"

        removeClippedSubviews={
          true
        }

      />


      {/* ==================================================
          FEATURE GATE MODAL
      ================================================== */}

      <FeatureGateModal

        visible={
          showFeatureModal
        }

        onClose={() =>
          setShowFeatureModal(false)
        }

      />


      {/* ==================================================
          BOTTOM NAV
      ================================================== */}

      <BottomNav
        activeTab="Dictionary"
      />

    </View>

  );

}