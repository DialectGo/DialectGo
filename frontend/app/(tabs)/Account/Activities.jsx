import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../../shared/lib/supabase';
import { ACTIVITIES_API_BASE } from '../../../shared/config/apiConfig';
import ProfileTopBar from '../../../shared/components/ProfileTopBar';

const TABS = ['Posts', 'Translations', 'Comments', 'Bookmarks'];

export default function Activities() {
  const [activities, setActivities] = useState({
    posts: [],
    translations: [],
    comments: [],
    bookmarks: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Posts');
  const router = useRouter();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch(ACTIVITIES_API_BASE, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await response.json();
      if (json.success) {
        setActivities({
          posts: json.data.posts || [],
          translations: json.data.translations || [],
          comments: json.data.comments || [],
          bookmarks: json.data.bookmarks || [],
        });
      }
    } catch (error) {
      console.error('[Activities] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToWiki = (id) => {
    if (id) router.push({ pathname: '/(tabs)/Wiki/SubmissionDetail', params: { id } });
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigateToWiki(item.id)}>
      <View style={styles.cardHeader}>
        <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
        <Text style={styles.cardTitle}>{item.source_term}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{item.translation}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
        <Text style={[styles.statusText, item.status === 'verified' && { color: '#059669' }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTranslation = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="language-outline" size={20} color="#8B5CF6" />
        <Text style={styles.cardTitle}>{item.source_text}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{item.user_translation}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
        <Text style={[styles.statusText, item.status === 'approved' && { color: '#059669' }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  const renderComment = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigateToWiki(item.submission_id)}>
      <View style={styles.cardHeader}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#10B981" />
        <Text style={styles.cardTitle}>On: {item.dialect_submissions?.source_term}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{item.content}</Text>
      <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  const renderBookmark = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigateToWiki(item.id)}>
      <View style={styles.cardHeader}>
        <Ionicons name="bookmark-outline" size={20} color="#F59E0B" />
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
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD54F" barStyle="dark-content" />
      <ProfileTopBar title="My Activities" />

      <View style={styles.tabsContainer}>
        {TABS.map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFD54F" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, idx) => item.id ? item.id.toString() : idx.toString()}
          renderItem={render}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  activeTabBtn: {
    backgroundColor: '#1F2937',
  },
  tabText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  }
});
