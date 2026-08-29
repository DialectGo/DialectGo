import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator,  StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileTopBar from '../../components/ProfileTopBar';
import { formatDateDisplay } from '../../shared/utils/dateUtils';
import { useActivities } from '../../shared/hooks/profile/useActivities';
import { colors } from '../../shared/theme/colorPalette';

const TABS = ['Posts', 'Translations', 'Comments', 'Bookmarks'];

export default function ActivitiesScreen() {
  const { activities, loading, activeTab, setActiveTab, navigateToWiki } = useActivities();

  const renderPost = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigateToWiki(item.id)}>
      <View style={styles.cardHeader}>
        <Ionicons name="document-text-outline" size={16} color={colors.info} />
        <Text style={styles.cardTitle}>{item.source_term}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{item.translation}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{formatDateDisplay(item.created_at)}</Text>
        <Text style={[styles.statusText, item.status === 'verified' && { color: colors.success }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
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
    <TouchableOpacity style={styles.card} onPress={() => navigateToWiki(item.id)}>
      <View style={styles.cardHeader}>
        <Ionicons name="bookmark-outline" size={16} color={colors.primaryDark} />
        <Text style={styles.cardTitle}>{item.source_term}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{item.translation}</Text>
    </TouchableOpacity>
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
    fontSize: 16,
    color: colors.textGray,
  }
});
