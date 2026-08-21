import React from 'react';
import { FlatList, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import DictionaryEntryCard from './DictionaryEntryCard';

export default function DictionaryList({
    searchQuery,
    isConnected,
    isGuestMode,
    isOffline,
    loading,
    error,
    refreshing,
    handleRefresh,
    refreshBrowseData,
    isFetchingMore,
    handleLoadMore,
    offlineResults,
    offlineBrowseData,
    searchResults,
    browseData,
    styles,
    router
}) {
    const displayData = !isConnected
        ? searchQuery.trim() ? offlineResults : offlineBrowseData
        : isGuestMode
            ? searchQuery.trim() ? offlineResults : offlineBrowseData
            : searchQuery.trim() ? searchResults : browseData;

    const renderItem = ({ item }) => {
        return <DictionaryEntryCard item={item} router={router} styles={styles} />;
    };

    const keyExtractor = (item, index) => {
        return item.id?.toString() || index.toString();
    };

    const handleEndReached = () => {
        if (isOffline || isFetchingMore || !handleLoadMore) {
            return;
        }

        if (!searchQuery.trim() && !isGuestMode) {
            handleLoadMore();
        }
    };

    const renderListEmpty = () => {
        if (loading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#FFD54F" />
                </View>
            );
        }

        if (error && !loading) {
            return (
                <View style={[styles.emptyContainer, { paddingHorizontal: 20 }]}>
                    <View style={{ padding: 10, backgroundColor: "#FFE0E0", borderRadius: 8, width: "100%" }}>
                        <Text style={{ color: "#C00", fontSize: 12 }}>{error}</Text>
                    </View>
                </View>
            );
        }

        if (searchQuery.trim() && displayData.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={{ fontSize: 14, color: "#999", textAlign: "center" }}>
                        No results found for "{searchQuery}"
                    </Text>
                </View>
            );
        }

        return null;
    };

    const renderFooter = () => {
        if (isFetchingMore && !isOffline) {
            return <ActivityIndicator color="#FFD54F" style={{ marginVertical: 15 }} />;
        }
        return null;
    };

    return (
        <FlatList
            data={displayData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => handleRefresh(refreshBrowseData)}
                    tintColor="#421C00"
                    colors={["#FFD54F"]}
                />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            contentContainerStyle={[
                styles.listContent,
                { paddingBottom: 120 },
                displayData.length === 0 && { flexGrow: 1 }
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderListEmpty}
            ListFooterComponent={renderFooter}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
        />
    );
}
