import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, StatusBar, Alert, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../shared/lib/supabase';
import TopBar from '../../../shared/components/TopBar';
import BottomNav from '../../../shared/components/BottomNav';
import SubmitTermModal from '../../../shared/components/SubmitTermModal';
import GlobalWikiAssistantModal from '../../../shared/components/GlobalWikiAssistantModal';
import { WIKI_API_BASE } from '../../../shared/config/apiConfig';

const REGIONS = ['All', 'Batangueño', 'Boholano', 'General Cebuano', 'General Tagalog'];
const CATEGORIES = ['All', 'Slang', 'Idiom', 'Colloquial', 'Literal'];
const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Voted', value: 'most_voted' },
  { label: 'Verified', value: 'verified' },
];
const TYPE_FILTERS = ['All', 'Term', 'Question'];

export default function WikiFeed() {
  const { slide } = useLocalSearchParams();

  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSort, setActiveSort] = useState('newest');
  const [activeType, setActiveType] = useState('All');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const fetchSubmissions = useCallback(async (pageNum = 1, append = false) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '20',
        sort: activeSort,
      });
      if (activeRegion !== 'All') params.append('region', activeRegion);
      if (activeCategory !== 'All') params.append('category', activeCategory);
      if (activeType !== 'All') params.append('type', activeType);
      if (search.trim()) params.append('search', search.trim());

      const response = await fetch(`${WIKI_API_BASE}?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await response.json();

      if (json.success) {
        if (append) {
          setSubmissions(prev => [...prev, ...json.data]);
        } else {
          setSubmissions(json.data);
        }
        setTotal(json.pagination.total);
        setHasMore(json.data.length === 20);
      }
    } catch (err) {
      console.error('[WikiFeed] Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeRegion, activeCategory, activeSort, activeType, search]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchSubmissions(1);
  }, [activeRegion, activeCategory, activeSort, activeType]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setPage(1);
      fetchSubmissions(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchSubmissions(1);
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSubmissions(nextPage, true);
  };

  const handleVote = async (submissionId, voteType) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${WIKI_API_BASE}/${submissionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ vote_type: voteType }),
      });
      const json = await response.json();

      if (json.success) {
        // Update the local card
        setSubmissions(prev =>
          prev.map(s => s.id === submissionId
            ? { ...s, upvotes: json.upvotes, status: json.promoted ? 'verified' : s.status }
            : s
          )
        );
        if (json.promoted) {
          Alert.alert('🎉 Verified!', 'This term has been added to the translation corpus!');
        }
      }
    } catch (err) {
      console.error('[WikiFeed] Vote error:', err);
    }
  };

  const handleSubmitSuccess = () => {
    setShowSubmitModal(false);
    setPage(1);
    fetchSubmissions(1);
  };

  // --- RENDER ---

  const renderCard = ({ item }) => {
    const authorName = item.profiles?.username
      || `${item.profiles?.first_name || ''} ${item.profiles?.last_name || ''}`.trim()
      || 'Anonymous';

    const isQuestion = item.type === 'Question';

    return (
      <TouchableOpacity
        style={[styles.card, isQuestion && styles.questionCard]}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/(tabs)/Wiki/SubmissionDetail', params: { id: item.id } })}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
            {isQuestion && (
              <Ionicons name="help-circle" size={18} color="#7C3AED" />
            )}
            <Text style={styles.sourceTerm} numberOfLines={2}>{item.source_term}</Text>
          </View>
          <View style={[styles.regionBadge, item.status === 'verified' && styles.verifiedBadge]}>
            <Text style={[styles.regionBadgeText, item.status === 'verified' && styles.verifiedBadgeText]}>
              {item.status === 'verified' ? '✓ Verified' : item.region}
            </Text>
          </View>
        </View>

        {/* Translation */}
        <Text style={styles.translation} numberOfLines={2}>{item.translation}</Text>

        {/* Tags row */}
        <View style={styles.tagsRow}>
          {isQuestion && (
            <View style={[styles.categoryChip, { backgroundColor: '#EDE9FE' }]}>
              <Text style={[styles.categoryChipText, { color: '#7C3AED' }]}>Question</Text>
            </View>
          )}
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{item.category}</Text>
          </View>
          {item.sentiment_tag && (
            <View style={[styles.categoryChip, styles.sentimentChip]}>
              <Text style={styles.sentimentChipText}>{item.sentiment_tag}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(item.id, 1)}>
            <Ionicons name="arrow-up-circle-outline" size={22} color="#10B981" />
            <Text style={styles.voteCount}>{item.upvotes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(item.id, -1)}>
            <Ionicons name="arrow-down-circle-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
          <Text style={styles.authorText}>by @{authorName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ animation: "fade" }} />
      <StatusBar barStyle="dark-content" />
      <TopBar title="Dialect Wiki" />

      {/* Type filter tabs */}
      <View style={styles.typeFilterRow}>
        {TYPE_FILTERS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.typeFilterBtn, activeType === t && styles.typeFilterBtnActive]}
            onPress={() => setActiveType(t)}
          >
            {t === 'Question' && <Ionicons name="help-circle-outline" size={14} color={activeType === t ? '#1F2937' : '#9CA3AF'} />}
            {t === 'Term' && <Ionicons name="text-outline" size={14} color={activeType === t ? '#1F2937' : '#9CA3AF'} />}
            <Text style={[styles.typeFilterText, activeType === t && styles.typeFilterTextActive]}>
              {t === 'All' ? 'All Posts' : t + 's'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search terms or translations..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Region filter pills */}
      <View style={styles.filterRow}>
        <FlatList
          data={REGIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterPill, activeRegion === item && styles.activePill]}
              onPress={() => setActiveRegion(item)}
            >
              <Text style={[styles.filterPillText, activeRegion === item && styles.activePillText]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Category & Sort row */}
      <View style={styles.secondFilterRow}>
        <TouchableOpacity
          style={styles.dropdownBtn}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
        >
          <Text style={styles.dropdownText}>
            {activeCategory === 'All' ? 'Category' : activeCategory}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.sortGroup}>
          {SORTS.map(s => (
            <TouchableOpacity
              key={s.value}
              style={[styles.sortChip, activeSort === s.value && styles.activeSortChip]}
              onPress={() => setActiveSort(s.value)}
            >
              <Text style={[styles.sortChipText, activeSort === s.value && styles.activeSortText]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category picker dropdown */}
      {showCategoryPicker && (
        <View style={styles.categoryDropdown}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={styles.categoryOption}
              onPress={() => { setActiveCategory(c); setShowCategoryPicker(false); }}
            >
              <Text style={[styles.categoryOptionText, activeCategory === c && styles.activeCategoryText]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Total count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{total} {total === 1 ? 'entry' : 'entries'}</Text>
      </View>

      {/* Feed */}
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FBBF24" />
        </View>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
          }
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

      {/* FABs */}
      <View style={styles.fabContainer}>
        {/* Ask AI FAB */}
        <TouchableOpacity
          style={[styles.fab, styles.aiFab]}
          activeOpacity={0.85}
          onPress={() => setShowAiModal(true)}
        >
          <Ionicons name="sparkles" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Add Entry FAB */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => setShowSubmitModal(true)}
        >
          <Ionicons name="add" size={28} color="#1F2937" />
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  typeFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 8,
  },
  typeFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  typeFilterBtnActive: {
    backgroundColor: '#FEF3C7',
  },
  typeFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  typeFilterTextActive: {
    color: '#1F2937',
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  filterRow: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  activePill: {
    backgroundColor: '#FBBF24',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activePillText: {
    color: '#1F2937',
    fontWeight: '800',
  },
  secondFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },
  sortGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  activeSortChip: {
    backgroundColor: '#FEF3C7',
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeSortText: {
    color: '#D97706',
    fontWeight: '800',
  },
  categoryDropdown: {
    position: 'absolute',
    top: 200,
    left: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    minWidth: 140,
  },
  categoryOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#FBBF24',
    fontWeight: '800',
  },
  countRow: {
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  questionCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#7C3AED',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceTerm: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
  },
  regionBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  regionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
  },
  verifiedBadgeText: {
    color: '#059669',
  },
  translation: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
    marginBottom: 10,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  sentimentChip: {
    backgroundColor: '#EDE9FE',
  },
  sentimentChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    paddingTop: 10,
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 4,
  },
  authorText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    gap: 16,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  aiFab: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
