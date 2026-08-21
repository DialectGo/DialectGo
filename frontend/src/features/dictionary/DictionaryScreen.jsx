import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";

import { useRouter, Stack, useLocalSearchParams } from "expo-router";

import BottomNav from "../../components/BottomNav";
import TopBar from "../../components/TopBar";
import DictionaryFilters from "../../shared/components/dictionary/DictionaryFilters";
import FeatureGateModal from "../../shared/components/FeatureGateModal";

import { useDictionaryBrowse } from "../../shared/hooks/dictionary/useDictionaryBrowse";
import { useOfflineSearch } from "../../shared/hooks/dictionary/useOfflineSearch";
import { useDictionaryGuestMode } from "../../shared/hooks/dictionary/useDictionaryGuestMode";
import { useDictionarySearch } from "../../shared/hooks/dictionary/useDictionarySearch";
import DictionaryList from "../../shared/components/dictionary/DictionaryList";

import { styles } from "./styles/DictionaryStyles";

export default function DictionaryScreen() {
  const { slide, search } = useLocalSearchParams();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { isGuestMode, setIsGuestMode, isConnected, checkGuestMode } =
    useDictionaryGuestMode();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    error,
    refreshing,
    handleRefresh,
  } = useDictionarySearch({
    isGuestMode,
    isConnected,
    checkGuestMode,
  });

  const {
    browseData,
    isFetchingMore,
    handleLoadMore,
    filters,
    refreshBrowseData,
  } = useDictionaryBrowse(searchQuery);

  const { isOffline, offlineResults, offlineBrowseData } = useOfflineSearch(
    searchQuery,
    isGuestMode,
  );

  const [showFeatureModal, setShowFeatureModal] = useState(false);

  useEffect(() => {
    if (search && typeof search === 'string') {
      setSearchQuery(search);
    }
  }, [search, setSearchQuery]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          animation: "fade",
        }}
      />
      <TopBar
        titlePrimary="DialectGo"
        titleSecondary="Dictionary"
        screenType="dictionary"
        onHistoryPress={() => {
          if (isGuestMode) {
            setShowFeatureModal(true);
            return;
          }
          router.push("/Dictionary/History");
        }}
        onSaveWordsPress={() => {
          if (isGuestMode) {
            setShowFeatureModal(true);
            return;
          }
          router.push("/Dictionary/SaveWords");
        }}
      />
      {isGuestMode && (
        <View
          style={{
            backgroundColor: "#421C00",
            padding: 5,
            alignItems: "center",
            marginTop: insets.top + 55,
          }}
        >
          <Text
            style={{
              color: "#FFD54F",
              fontSize: 11,
              fontWeight: "bold",
            }}
          >
            GUEST MODE: OFFLINE DICTIONARY ENABLED
          </Text>
        </View>
      )}
      <View
        style={[
          styles.contentWrapper,

          {
            marginTop: isGuestMode ? 8 : insets.top + 65,
          },
        ]}
      >
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={
              isGuestMode ? "Search offline dictionary..." : "Search words..."
            }
            placeholderTextColor="#421C00"
            value={searchQuery}
            onChangeText={setSearchQuery}
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
              source={require("../../../assets/images/search.png")}

              style={styles.searchIcon}
            />
          )}
        </View>
        {!searchQuery.trim() && !isGuestMode && (
          <DictionaryFilters {...filters} />
        )}
      </View>
      <DictionaryList 
        searchQuery={searchQuery}
        isConnected={isConnected}
        isGuestMode={isGuestMode}
        isOffline={isOffline}
        loading={loading}
        error={error}
        refreshing={refreshing}
        handleRefresh={handleRefresh}
        refreshBrowseData={refreshBrowseData}
        isFetchingMore={isFetchingMore}
        handleLoadMore={handleLoadMore}
        offlineResults={offlineResults}
        offlineBrowseData={offlineBrowseData}
        searchResults={searchResults}
        browseData={browseData}
        styles={styles}
        router={router}
      />
      <FeatureGateModal
        visible={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
      />
      <BottomNav activeTab="Dictionary" />
    </View>
  );
}
