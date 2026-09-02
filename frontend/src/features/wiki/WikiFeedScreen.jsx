import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import { colors } from '../../shared/theme/colorPalette';
import SubmitTermModal from '../../shared/components/wiki/SubmitTermModal';
import GlobalWikiAssistantModal from '../../shared/components/wiki/GlobalWikiAssistantModal';

import { useWikiFeed } from '../../shared/hooks/wiki/useWikiFeed';
import WikiFeedCard from '../../shared/components/wiki/WikiFeedCard';
import WikiFeedFilters from '../../shared/components/wiki/WikiFeedFilters';

export default function WikiFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const {
    submissions,
    loading,
    refreshing,
    page,
    hasMore,
    total,
    
    search,
    setSearch,
    activeRegion,
    setActiveRegion,
    activeCategory,
    setActiveCategory,
    activeSort,
    setActiveSort,
    activeType,
    setActiveType,
    
    showSubmitModal,
    setShowSubmitModal,
    showAiModal,
    setShowAiModal,
    showFilterMenu,
    setShowFilterMenu,

    onRefresh,
    loadMore,
    handleVote,
    handleSubmitSuccess
  } = useWikiFeed();

  const renderCard = ({ item }) => (
    <WikiFeedCard
      item={item}
      router={router}
      handleVote={handleVote}
      styles={styles}
    />
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ animation: 'fade' }} />
      <StatusBar barStyle="dark-content" />

      <TopBar titlePrimary="DialectGo" titleSecondary="DialectWiki" />

      <WikiFeedFilters
        insets={insets}
        search={search}
        setSearch={setSearch}
        activeRegion={activeRegion}
        setActiveRegion={setActiveRegion}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeSort={activeSort}
        setActiveSort={setActiveSort}
        activeType={activeType}
        setActiveType={setActiveType}
        showFilterMenu={showFilterMenu}
        setShowFilterMenu={setShowFilterMenu}
        total={total}
        styles={styles}
      />

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FBBF24" />
        </View>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={item => item.id.toString()}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { paddingTop: 8 }]}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            hasMore && submissions.length > 0 ? (
              <ActivityIndicator size="small" color="#FBBF24" style={{ paddingVertical: 20 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to contribute a dialect term!</Text>
            </View>
          }
        />
      )}

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.aiFab]}
          activeOpacity={0.85}
          onPress={() => setShowAiModal(true)}
        >
          <Image
            source={require('../../../assets/icons/wiki/wiki_ai_chatbot_icon.png')}
            style={styles.aiFabIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => setShowSubmitModal(true)}
        >
          <Image
            source={require('../../../assets/icons/wiki/contribute_icon.png')}
            style={styles.fabIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <SubmitTermModal
        visible={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSuccess={handleSubmitSuccess}
      />

      <GlobalWikiAssistantModal
        visible={showAiModal}
        onClose={() => setShowAiModal(false)}
      />

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF8' },
  headerArea: { backgroundColor: '#FFFDF8', paddingBottom: 4, zIndex: 20 },
  typeTabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 7, marginBottom: 9 },
  typeTab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 13, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6' },
  typeTabActive: { backgroundColor: '#FFF0BF' },
  typeTabText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  typeTabTextActive: { color: '#4F3422', fontWeight: '800' },
  searchContainer: { height: 45, flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, paddingHorizontal: 13, backgroundColor: '#FFFFFF', borderRadius: 13, borderWidth: 1, borderColor: '#F0EBDD', shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 1 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1F2937', fontWeight: '500' },
  filterControlRow: { marginTop: 10 },
  regionList: { paddingHorizontal: 20, paddingRight: 30 },
  regionPill: { height: 32, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 16, backgroundColor: '#F3F4F6', marginRight: 7 },
  regionPillActive: { backgroundColor: '#FBBF24' },
  regionPillText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  regionPillTextActive: { color: '#4F3422', fontWeight: '800' },
  secondaryControls: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 8 },
  filterButton: { height: 34, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', gap: 5 },
  filterButtonActive: { backgroundColor: '#FFF4D6', borderColor: '#FBBF24' },
  filterButtonText: { fontSize: 11, fontWeight: '700', color: '#4F3422' },
  sortContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 8, flex: 1, justifyContent: 'flex-end', gap: 5 },
  sortButton: { height: 32, paddingHorizontal: 9, justifyContent: 'center', borderRadius: 9, backgroundColor: '#F3F4F6' },
  sortButtonActive: { backgroundColor: '#FFF0BF' },
  sortButtonText: { fontSize: 10, fontWeight: '600', color: '#9CA3AF' },
  sortButtonTextActive: { color: '#D97706', fontWeight: '800' },
  categoryMenu: { position: 'absolute', top: 182, left: 20, width: 155, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#F0EBDD', shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 8, zIndex: 100 },
  categoryOption: { height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 13 },
  categoryOptionText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  categoryOptionActive: { color: '#D97706', fontWeight: '800' },
  countRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 8, marginBottom: 2 },
  countText: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginRight: 8 },
  countLine: { flex: 1, height: 1, backgroundColor: '#F0EBDD' },
  listContent: { paddingBottom: 150 }, // Removed horizontal padding so the line goes full width if desired, or keep it
  card: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#FFFFFF' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  authorAvatar: { marginRight: 8 },
  headerAuthorInfo: { justifyContent: 'center' },
  headerAuthorName: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  headerAuthorDate: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  termContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  sourceTerm: { flex: 1, fontSize: 15, fontWeight: '800', color: '#1F2937' },
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  regionBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  regionBadgeText: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  verifiedBadge: { backgroundColor: '#D1FAE5' },
  verifiedBadgeText: { color: '#059669' },
  questionChip: { backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  questionChipText: { fontSize: 10, fontWeight: '700', color: '#7C3AED' },
  categoryChip: { backgroundColor: '#FFF4D6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  categoryChipText: { fontSize: 10, fontWeight: '700', color: '#D97706' },
  sentimentChip: { backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sentimentChipText: { fontSize: 10, fontWeight: '700', color: '#7C3AED' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  engagementBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  engagementEmoji: { fontSize: 14 },
  engagementText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 14 },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 5, textAlign: 'center' },
  fabContainer: { position: 'absolute', bottom: 120, right: 20, gap: 12, alignItems: 'center' },
  fab: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', shadowColor: colors.shadowGold, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5, elevation: 5 },
  aiFab: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.shadowGold, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5, elevation: 5 },
  fabIcon: { width: 28, height: 28, resizeMode: 'contain' },
  aiFabIcon: { width: 42, height: 42, resizeMode: 'contain' },
});
