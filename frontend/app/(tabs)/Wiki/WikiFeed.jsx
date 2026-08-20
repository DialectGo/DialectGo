import React, { useState, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Alert,
  RefreshControl,
  Image,  
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

import { supabase } from '../../../src/shared/api/supabase';
import TopBar from '../../../src/components/TopBar';
import BottomNav from '../../../src/components/BottomNav';
import SubmitTermModal from '../../../src/features/wiki/components/SubmitTermModal';
import GlobalWikiAssistantModal from '../../../src/features/wiki/components/GlobalWikiAssistantModal';
import { fetchSubmissions as fetchSubmissionsService, voteSubmission } from '../../../src/shared/services/wikiService';

const REGIONS = [
  'All',
  'Batangueño',
  'Boholano',
  'General Cebuano',
  'General Tagalog',
];

const CATEGORIES = [
  'All',
  'Slang',
  'Idiom',
  'Colloquial',
  'Literal',
];

const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Voted', value: 'most_voted' },
  { label: 'Verified', value: 'verified' },
];

const TYPE_FILTERS = ['All', 'Term', 'Question'];

export default function WikiFeed() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // ======================================================
  // FILTER STATES
  // ======================================================

  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSort, setActiveSort] = useState('newest');
  const [activeType, setActiveType] = useState('All');

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // ======================================================
  // FETCH SUBMISSIONS
  // ======================================================

  const fetchSubmissions = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        const filters = {
          sort: activeSort,
          region: activeRegion,
          category: activeCategory,
          type: activeType,
          search,
        };

        const { data, pagination } = await fetchSubmissionsService(pageNum, filters);

        if (append) {
          setSubmissions(prev => [...prev, ...data]);
        } else {
          setSubmissions(data);
        }

        setTotal(pagination.total);
        setHasMore(data.length === 20);
      } catch (err) {
        console.error('[WikiFeed] Fetch error:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeRegion, activeCategory, activeSort, activeType, search]
  );

  // ======================================================
  // FILTER CHANGE
  // ======================================================

  useEffect(() => {
    setLoading(true);
    setPage(1);

    fetchSubmissions(1);
  }, [
    activeRegion,
    activeCategory,
    activeSort,
    activeType,
  ]);

  // ======================================================
  // SEARCH DEBOUNCE
  // ======================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setPage(1);

      fetchSubmissions(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ======================================================
  // REFRESH
  // ======================================================

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchSubmissions(1);
  };

  // ======================================================
  // LOAD MORE
  // ======================================================

  const loadMore = () => {
    if (!hasMore || loading) return;

    const nextPage = page + 1;

    setPage(nextPage);
    fetchSubmissions(nextPage, true);
  };

  // ======================================================
  // VOTE
  // ======================================================

  const handleVote = async (submissionId, voteType) => {
    try {
      const result = await voteSubmission(submissionId, voteType);

      if (result) {
        setSubmissions(prev =>
          prev.map(s =>
            s.id === submissionId
              ? { ...s, upvotes: result.upvotes, status: result.promoted ? 'verified' : s.status }
              : s
          )
        );

        if (result.promoted) {
          Alert.alert('🎉 Verified!', 'This term has been added to the translation corpus!');
        }
      }
    } catch (err) {
      console.error('[WikiFeed] Vote error:', err);
    }
  };

  // ======================================================
  // SUBMIT SUCCESS
  // ======================================================

  const handleSubmitSuccess = () => {
    setShowSubmitModal(false);
    setPage(1);
    fetchSubmissions(1);
  };

  // ======================================================
  // RENDER CARD
  // ======================================================

  const renderCard = ({ item }) => {
    const authorName =
      item.profiles?.username ||
      `${item.profiles?.first_name || ''} ${
        item.profiles?.last_name || ''
      }`.trim() ||
      'Anonymous';

    const isQuestion = item.type === 'Question';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isQuestion && styles.questionCard,
        ]}
        activeOpacity={0.75}
        onPress={() =>
          router.push({
            pathname:
              '/(tabs)/Wiki/SubmissionDetail',
            params: {
              id: item.id,
            },
          })
        }
      >
        {/* =========================
            CARD HEADER
        ========================== */}

        <View style={styles.cardHeader}>
          <View style={styles.termContainer}>
            {isQuestion && (
              <Ionicons
                name="help-circle"
                size={18}
                color="#7C3AED"
              />
            )}

            <Text
              style={styles.sourceTerm}
              numberOfLines={2}
            >
              {item.source_term}
            </Text>
          </View>

          <View
            style={[
              styles.regionBadge,
              item.status === 'verified' &&
                styles.verifiedBadge,
            ]}
          >
            <Text
              style={[
                styles.regionBadgeText,
                item.status === 'verified' &&
                  styles.verifiedBadgeText,
              ]}
            >
              {item.status === 'verified'
                ? '✓ Verified'
                : item.region}
            </Text>
          </View>
        </View>

        {/* =========================
            TRANSLATION
        ========================== */}

        <Text
          style={styles.translation}
          numberOfLines={2}
        >
          {item.translation}
        </Text>

        {/* =========================
            TAGS
        ========================== */}

        <View style={styles.tagsRow}>
          {isQuestion && (
            <View style={styles.questionChip}>
              <Text style={styles.questionChipText}>
                Question
              </Text>
            </View>
          )}

          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>
              {item.category}
            </Text>
          </View>

          {item.sentiment_tag && (
            <View style={styles.sentimentChip}>
              <Text style={styles.sentimentChipText}>
                {item.sentiment_tag}
              </Text>
            </View>
          )}
        </View>

        {/* =========================
            CARD FOOTER
        ========================== */}

        <View style={styles.cardFooter}>
          <View style={styles.voteSection}>
            <TouchableOpacity
              style={styles.voteBtn}
              onPress={() =>
                handleVote(item.id, 1)
              }
            >
              <Ionicons
                name="arrow-up-circle-outline"
                size={21}
                color="#10B981"
              />

              <Text style={styles.voteCount}>
                {item.upvotes || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.voteBtn}
              onPress={() =>
                handleVote(item.id, -1)
              }
            >
              <Ionicons
                name="arrow-down-circle-outline"
                size={21}
                color="#EF4444"
              />
            </TouchableOpacity>
          </View>

          <Text
            style={styles.authorText}
            numberOfLines={1}
          >
            by @{authorName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ======================================================
  // FILTER LABEL
  // ======================================================

  const filterLabel =
    activeRegion !== 'All'
      ? activeRegion
      : activeCategory !== 'All'
      ? activeCategory
      : 'Filters';

  // ======================================================
  // UI
  // ======================================================

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          animation: 'fade',
        }}
      />

      <StatusBar barStyle="dark-content" />

      {/* =========================
          TOP BAR
      ========================== */}

      <TopBar
        titlePrimary="DialectGo"
        titleSecondary="DialectWiki"
      />

      {/* =========================
          FIXED FILTER HEADER
      ========================== */}

      <View
        style={[
          styles.headerArea,
          {
            paddingTop: insets.top + 65,
          },
        ]}
      >
        {/* TYPE TABS */}

        <View style={styles.typeTabs}>
          {TYPE_FILTERS.map(type => {
            const active =
              activeType === type;

            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeTab,
                  active &&
                    styles.typeTabActive,
                ]}
                onPress={() =>
                  setActiveType(type)
                }
              >
                {type === 'Question' && (
                  <Ionicons
                    name="help-circle-outline"
                    size={15}
                    color={
                      active
                        ? '#4F3422'
                        : '#9CA3AF'
                    }
                  />
                )}

                {type === 'Term' && (
                  <Ionicons
                    name="text-outline"
                    size={15}
                    color={
                      active
                        ? '#4F3422'
                        : '#9CA3AF'
                    }
                  />
                )}

                <Text
                  style={[
                    styles.typeTabText,
                    active &&
                      styles.typeTabTextActive,
                  ]}
                >
                  {type === 'All'
                    ? 'All Posts'
                    : `${type}s`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SEARCH */}

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={19}
            color="#9CA3AF"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search terms or translations..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTER / SORT ROW */}

        <View style={styles.filterControlRow}>
          {/* REGION */}

          <FlatList
            data={REGIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item}
            contentContainerStyle={
              styles.regionList
            }
            renderItem={({ item }) => {
              const active =
                activeRegion === item;

              return (
                <TouchableOpacity
                  style={[
                    styles.regionPill,
                    active &&
                      styles.regionPillActive,
                  ]}
                  onPress={() =>
                    setActiveRegion(item)
                  }
                >
                  <Text
                    style={[
                      styles.regionPillText,
                      active &&
                        styles.regionPillTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* SECONDARY CONTROLS */}

        <View style={styles.secondaryControls}>
          {/* CATEGORY */}

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeCategory !== 'All' &&
                styles.filterButtonActive,
            ]}
            onPress={() =>
              setShowFilterMenu(
                !showFilterMenu
              )
            }
          >
            <Ionicons
              name="options-outline"
              size={16}
              color="#4F3422"
            />

            <Text style={styles.filterButtonText}>
              {filterLabel}
            </Text>

            <Ionicons
              name={
                showFilterMenu
                  ? 'chevron-up'
                  : 'chevron-down'
              }
              size={15}
              color="#6B7280"
            />
          </TouchableOpacity>

          {/* SORT */}

          <View style={styles.sortContainer}>
            {SORTS.map(sort => {
              const active =
                activeSort === sort.value;

              return (
                <TouchableOpacity
                  key={sort.value}
                  style={[
                    styles.sortButton,
                    active &&
                      styles.sortButtonActive,
                  ]}
                  onPress={() =>
                    setActiveSort(
                      sort.value
                    )
                  }
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      active &&
                        styles.sortButtonTextActive,
                    ]}
                  >
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CATEGORY MENU */}

        {showFilterMenu && (
          <View style={styles.categoryMenu}>
            {CATEGORIES.map(category => {
              const active =
                activeCategory === category;

              return (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryOption}
                  onPress={() => {
                    setActiveCategory(
                      category
                    );
                    setShowFilterMenu(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      active &&
                        styles.categoryOptionActive,
                    ]}
                  >
                    {category}
                  </Text>

                  {active && (
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color="#D97706"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* COUNT */}

        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {total}{' '}
            {total === 1
              ? 'entry'
              : 'entries'}
          </Text>

          <View style={styles.countLine} />
        </View>
      </View>

      {/* =========================
          FEED
      ========================== */}

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#FBBF24"
          />
        </View>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={item =>
            item.id.toString()
          }
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: 8,
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FBBF24"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            hasMore &&
            submissions.length > 0 ? (
              <ActivityIndicator
                size="small"
                color="#FBBF24"
                style={{
                  paddingVertical: 20,
                }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="book-outline"
                size={48}
                color="#D1D5DB"
              />

              <Text style={styles.emptyTitle}>
                No entries yet
              </Text>

              <Text
                style={styles.emptySubtitle}
              >
                Be the first to contribute a
                dialect term!
              </Text>
            </View>
          }
        />
      )}

      {/* =========================
          FLOATING BUTTONS
      ========================== */}

      <View style={styles.fabContainer}>
        {/* ASK AI */}

        <TouchableOpacity
          style={[
            styles.fab,
            styles.aiFab,
          ]}
          activeOpacity={0.85}
          onPress={() =>
            setShowAiModal(true)
          }
        >
          <Ionicons
            name="sparkles"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* ADD ENTRY */}

<TouchableOpacity
  style={styles.fab}
  activeOpacity={0.85}
  onPress={() =>
    setShowSubmitModal(true)
  }
>
  <Image
    source={require('../../../assets/icons/actions/add_icon.png')}
    style={styles.fabIcon}
    resizeMode="contain"
  />
</TouchableOpacity>
      </View>

      {/* =========================
          MODALS
      ========================== */}

      <SubmitTermModal
        visible={showSubmitModal}
        onClose={() =>
          setShowSubmitModal(false)
        }
        onSuccess={
          handleSubmitSuccess
        }
      />

      <GlobalWikiAssistantModal
        visible={showAiModal}
        onClose={() =>
          setShowAiModal(false)
        }
      />

      {/* =========================
          BOTTOM NAV
      ========================== */}

      <BottomNav />
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },

  // ======================================================
  // HEADER AREA
  // ======================================================

  headerArea: {
    backgroundColor: '#FFFDF8',
    paddingBottom: 4,
    zIndex: 20,
  },

  // ======================================================
  // TYPE TABS
  // ======================================================

  typeTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 7,
    marginBottom: 9,
  },

  typeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,

    paddingHorizontal: 13,
    height: 36,

    borderRadius: 18,

    backgroundColor: '#F3F4F6',
  },

  typeTabActive: {
    backgroundColor: '#FFF0BF',
  },

  typeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  typeTabTextActive: {
    color: '#4F3422',
    fontWeight: '800',
  },

  // ======================================================
  // SEARCH
  // ======================================================

  searchContainer: {
    height: 45,

    flexDirection: 'row',
    alignItems: 'center',

    marginHorizontal: 20,

    paddingHorizontal: 13,

    backgroundColor: '#FFFFFF',

    borderRadius: 13,

    borderWidth: 1,
    borderColor: '#F0EBDD',

    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 5,
    elevation: 1,
  },

  searchInput: {
    flex: 1,

    marginLeft: 8,

    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },

  // ======================================================
  // REGION FILTER
  // ======================================================

  filterControlRow: {
    marginTop: 10,
  },

  regionList: {
    paddingHorizontal: 20,
    paddingRight: 30,
  },

  regionPill: {
    height: 32,

    paddingHorizontal: 12,

    justifyContent: 'center',

    borderRadius: 16,

    backgroundColor: '#F3F4F6',

    marginRight: 7,
  },

  regionPillActive: {
    backgroundColor: '#FBBF24',
  },

  regionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },

  regionPillTextActive: {
    color: '#4F3422',
    fontWeight: '800',
  },

  // ======================================================
  // SECONDARY FILTER CONTROLS
  // ======================================================

  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 20,

    marginTop: 8,
  },

  filterButton: {
    height: 34,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 10,

    borderRadius: 10,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E5E7EB',

    gap: 5,
  },

  filterButtonActive: {
    backgroundColor: '#FFF4D6',
    borderColor: '#FBBF24',
  },

  filterButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F3422',
  },

  // ======================================================
  // SORT
  // ======================================================

  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    marginLeft: 8,

    flex: 1,

    justifyContent: 'flex-end',

    gap: 5,
  },

  sortButton: {
    height: 32,

    paddingHorizontal: 9,

    justifyContent: 'center',

    borderRadius: 9,

    backgroundColor: '#F3F4F6',
  },

  sortButtonActive: {
    backgroundColor: '#FFF0BF',
  },

  sortButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  sortButtonTextActive: {
    color: '#D97706',
    fontWeight: '800',
  },

  // ======================================================
  // CATEGORY MENU
  // ======================================================

  categoryMenu: {
    position: 'absolute',

    top: 182,
    left: 20,

    width: 155,

    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    paddingVertical: 5,

    borderWidth: 1,
    borderColor: '#F0EBDD',

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 12,

    elevation: 8,

    zIndex: 100,
  },

  categoryOption: {
    height: 38,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 13,
  },

  categoryOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },

  categoryOptionActive: {
    color: '#D97706',
    fontWeight: '800',
  },

  // ======================================================
  // COUNT
  // ======================================================

  countRow: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 20,

    marginTop: 8,
    marginBottom: 2,
  },

  countText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',

    marginRight: 8,
  },

  countLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0EBDD',
  },

  // ======================================================
  // FEED
  // ======================================================

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },

  // ======================================================
  // CARD
  // ======================================================

  card: {
    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    padding: 16,

    marginBottom: 11,

    borderWidth: 1,
    borderColor: '#F1EEE7',

    shadowColor: '#000',
    shadowOpacity: 0.035,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 7,

    elevation: 2,
  },

  questionCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#7C3AED',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    marginBottom: 7,
  },

  termContainer: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 7,

    paddingRight: 8,
  },

  sourceTerm: {
    flex: 1,

    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
  },

  regionBadge: {
    backgroundColor: '#F3F4F6',

    paddingHorizontal: 9,
    paddingVertical: 4,

    borderRadius: 8,

    maxWidth: 115,
  },

  regionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },

  verifiedBadge: {
    backgroundColor: '#D1FAE5',
  },

  verifiedBadgeText: {
    color: '#059669',
  },

  // ======================================================
  // TRANSLATION
  // ======================================================

  translation: {
    fontSize: 14,

    color: '#4B5563',

    fontWeight: '500',

    lineHeight: 20,

    marginBottom: 9,
  },

  // ======================================================
  // TAGS
  // ======================================================

  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,

    marginBottom: 11,
  },

  categoryChip: {
    backgroundColor: '#FFF4D6',

    paddingHorizontal: 8,
    paddingVertical: 4,

    borderRadius: 6,
  },

  categoryChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },

  questionChip: {
    backgroundColor: '#EDE9FE',

    paddingHorizontal: 8,
    paddingVertical: 4,

    borderRadius: 6,
  },

  questionChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },

  sentimentChip: {
    backgroundColor: '#F3E8FF',

    paddingHorizontal: 8,
    paddingVertical: 4,

    borderRadius: 6,
  },

  sentimentChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },

  // ======================================================
  // CARD FOOTER
  // ======================================================

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',

    borderTopWidth: 1,
    borderTopColor: '#F5F3EF',

    paddingTop: 9,
  },

  voteSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',

    marginRight: 12,
  },

  voteCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',

    marginLeft: 3,
  },

  authorText: {
    flex: 1,

    textAlign: 'right',

    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // ======================================================
  // LOADING
  // ======================================================

  loadingContainer: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',
  },

  // ======================================================
  // EMPTY
  // ======================================================

  emptyContainer: {
    alignItems: 'center',

    paddingTop: 60,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',

    marginTop: 14,
  },

  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',

    marginTop: 5,

    textAlign: 'center',
  },

  // ======================================================
  // FAB
  // ======================================================

  fabContainer: {
    position: 'absolute',

    bottom: 100,
    right: 20,

    gap: 12,

    alignItems: 'center',
  },

  fab: {
    width: 54,
    height: 54,

    borderRadius: 27,

    backgroundColor: '#ffe7ab',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#B7791F',
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 9,

    elevation: 6,
  },

  aiFab: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: '#7C3AED',

    shadowColor: '#7C3AED',
  },
  fabIcon: {
  width: 27,
  height: 27,
  resizeMode: 'contain',
},
});