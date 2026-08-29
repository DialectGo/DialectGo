import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator,  StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileTopBar from '../../components/ProfileTopBar';
import { formatDateDisplay } from '../../shared/utils/dateUtils';
import { useActivities } from '../../shared/hooks/profile/useActivities';
import { colors } from '../../shared/theme/colorPalette';
import WikiFeedCard from '../../shared/components/wiki/WikiFeedCard';
import { useRouter } from 'expo-router';

const TABS = ['Posts', 'Translations', 'Comments', 'Bookmarks'];

export default function ActivitiesScreen() {
  const { activities, loading, activeTab, setActiveTab, navigateToWiki } = useActivities();
  const router = useRouter();

  const handleVoteStub = () => {}; // No-op for activities screen, or implement if needed

  const renderPost = ({ item }) => (
    <WikiFeedCard
      item={item}
      router={router}
      handleVote={handleVoteStub}
      styles={wikiStyles}
    />
  );

  const renderTranslation = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="language-outline" size={16} color={colors.primaryDeep} />
        <Text style={styles.cardTitle}>{item.source_text}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{item.user_translation}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{formatDateDisplay(item.created_at)}</Text>
        <Text style={[styles.statusText, item.status === 'approved' && { color: colors.success }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  const renderComment = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigateToWiki(item.submission_id)}>
      <View style={styles.cardHeader}>
        <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.success} />
        <Text style={styles.cardTitle}>On: {item.dialect_submissions?.source_term}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{item.content}</Text>
      <Text style={styles.dateText}>{formatDateDisplay(item.created_at)}</Text>
    </TouchableOpacity>
  );

  const renderBookmark = ({ item }) => (
    <WikiFeedCard
      item={item}
      router={router}
      handleVote={handleVoteStub}
      styles={wikiStyles}
    />
  );

  const getActiveData = () => {
    switch (activeTab) {
      case 'Posts': return { data: activities.posts, render: renderPost };
      case 'Translations': return { data: activities.translations, render: renderTranslation };
      case 'Comments': return { data: activities.comments, render: renderComment };
      case 'Bookmarks': return { data: activities.bookmarks, render: renderBookmark };
      default: return { data: [], render: () => null };
    }
  };

  const { data, render } = getActiveData();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="dark-content" />
      <ProfileTopBar title="My Activities" />

      <View style={styles.tabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, idx) => item.id ? item.id.toString() : idx.toString()}
          renderItem={render}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={36} color={colors.textGray} />
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const wikiStyles = StyleSheet.create({
  card: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#FFFFFF', borderRadius: 10, marginBottom: 8, shadowColor: colors.shadowGold, shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2, borderWidth: 1, borderColor: colors.borderLight },
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
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsWrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 6,
    backgroundColor: colors.surfaceGray,
  },
  activeTabBtn: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: colors.shadowGold,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 8,
  },
  dateText: {
    fontSize: 10,
    color: colors.textGray,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primaryDeep,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textGray,
  }
});
