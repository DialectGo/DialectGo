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
import { useDictionarySearch } from "../../shared/hooks/dictionary/useDictionarySearch";
import DictionaryList from "../../shared/components/dictionary/DictionaryList";

import { styles } from "./styles/DictionaryStyles";

export default function DictionaryScreen() {
  const { slide, search } = useLocalSearchParams();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    error,
    refreshing,
    handleRefresh,
  } = useDictionarySearch();

  const {
    browseData,
    isFetchingMore,
    handleLoadMore,
    filters,
    refreshBrowseData,
  } = useDictionaryBrowse(searchQuery);



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
          router.push("/Dictionary/History");
        }}
        onSaveWordsPress={() => {
          router.push("/Dictionary/SaveWords");
        }}
      />
      <View
        style={[
          styles.contentWrapper,
          {
            marginTop: insets.top + 65,
          },
        ]}
      >
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search words..."
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
        {!searchQuery.trim() && (
          <DictionaryFilters {...filters} />
        )}
      </View>
      <DictionaryList 
        searchQuery={searchQuery}
        loading={loading}
        error={error}
        refreshing={refreshing}
        handleRefresh={handleRefresh}
        refreshBrowseData={refreshBrowseData}
        isFetchingMore={isFetchingMore}
        handleLoadMore={handleLoadMore}
        searchResults={searchResults}
        browseData={browseData}
        styles={styles}
        router={router}
      />
      <BottomNav activeTab="Dictionary" />
    </View>
  );
}
