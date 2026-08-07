import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Image,
  
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../shared/lib/supabase';
import RefreshContainer from '../../../shared/components/RefreshContainer'; // ✅ IMPORT REUSABLE REFRESH CONTAINER
import ProfileTopBar from '../../../shared/components/ProfileTopBar';
import { endpoints } from '../../../shared/config/apiConfig';

const API_BASE = endpoints.DICTIONARY_BASE;

export default function SaveWords() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ✅ STATE FOR PULL-TO-REFRESH
  const [selectedIds, setSelectedIds] = useState(new Set()); // Track selections
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchBookmarks(true); // Show the initial center spinner on mount
  }, []);

  const fetchBookmarks = async (showInitialSpinner = false) => {
    if (showInitialSpinner) setLoading(true);
    try {
      // 1. Get the current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      // 2. Fetch from your backend API
      const response = await fetch(`${API_BASE}/saved`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success && result.data && result.data.data) {
        setBookmarks(result.data.data);
      } else {
        setBookmarks([]);
      }
    } catch (error) {
      console.error("Error loading bookmarks from API:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ PULL-TO-REFRESH LIFECYCLE CALLBACK HANDLER
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setSelectedIds(new Set()); // Safely reset user selections on reload to avoid array sync issues
    await fetchBookmarks(false); // Let the RefreshControl container handle the spinning indicator UI
    setRefreshing(false);
  }, []);

  // Toggle single selection
  const toggleSelect = (id) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  // Select All logic
  const toggleSelectAll = () => {
    if (selectedIds.size === bookmarks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bookmarks.map(item => item.id)));
    }
  };

  // Handle Delete with Confirmation
  const confirmDelete = () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete ${selectedIds.size} item(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", style: "destructive", onPress: processDeletion }
      ]
    );
  };

  const processDeletion = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE}/delete-multiple`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });

      if (response.ok) {
        setBookmarks(prev => prev.filter(item => !selectedIds.has(item.id)));
        setSelectedIds(new Set());
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete items.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderItem = (item, index) => {
    const entry = item.entry || {};
    const translations = entry.translations || [];
    const isSelected = selectedIds.has(item.id);
    const trans1 = translations[0]?.target_entry?.word_term || '';
    const trans2 = translations[1]?.target_entry?.word_term || '';
    const usage1 = translations[0]?.target_entry?.example_usage || '';
    const usage2 = translations[1]?.target_entry?.example_usage || '';
    const translationDisplay = [trans1, trans2].filter(Boolean).join(' / ') || 'No translation';

    return (
      <View key={item.id?.toString() || index.toString()} style={styles.cardContainer}>
        {/* Custom Checkbox */}
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => toggleSelect(item.id)}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
            {isSelected && <View style={styles.checkboxInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.7}
          style={styles.card} 
          onPress={() => {
            router.push({
              pathname: '/Dictionary/ResultDictionary',
              params: {
                id: entry.id,
                wordTerm: entry.word_term,
                definition: entry.definition,
                partOfSpeech: entry.part_of_speech,
                phoneticTranscription: entry.phonetic_transcription,
                exampleUsage: entry.example_usage,
                translation1: trans1,
                translation2: trans2,
                usage1: usage1,
                usage2: usage2 
              }
            });
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.wordText}>{entry.word_term}</Text>
            <Text style={styles.translationText}>{translationDisplay}</Text>
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.posTag}>{entry.part_of_speech?.toUpperCase() || 'WORD'}</Text>
            <Image source={require('../../../assets/icons/star.png')} style={styles.starIcon} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ProfileTopBar title="Saved Words" />

      {/* CORE DISPLAY CONTENT INGESTED BY REFRESHCONTAINER */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFD54F" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <RefreshContainer
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={styles.listContainer}
          >
            {bookmarks.length > 0 ? (
              // ✅ MAP CONVERSION PREVENTS NESTED FLATLIST CONFLICTS
              <View style={{ paddingBottom: 40 }}>
                {bookmarks.map((item, index) => renderItem(item, index))}
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No saved words found.</Text>
              </View>
            )}
          </RefreshContainer>

          {/* ABSOLUTE STATIONARY FOOTER TOOLBAR */}
          {bookmarks.length > 0 && (
            <View style={styles.footerNav}>
              <TouchableOpacity style={styles.selectAllContainer} onPress={toggleSelectAll}>
                <View style={[styles.checkbox, selectedIds.size === bookmarks.length && styles.checkboxActive]}>
                  {selectedIds.size === bookmarks.length && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.selectAllText}>All</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.deleteBtn, selectedIds.size === 0 && styles.deleteBtnDisabled]} 
                onPress={confirmDelete}
                disabled={selectedIds.size === 0 || isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.deleteBtnText}>Delete ({selectedIds.size})</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  backImg: { width: 24, height: 24, tintColor: '#421C00' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFB800' },
  listContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 120, // Bottom spacing provides clearing space above absolute footer bar coords
    flexGrow: 1 
  },
  cardContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  checkboxContainer: { paddingRight: 10 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#FFB800', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#FFB800' },
  checkboxInner: { width: 10, height: 10, backgroundColor: '#FFF', borderRadius: 2 },
  card: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 15, flexDirection: 'row', elevation: 2 },
  wordText: { fontSize: 18, fontWeight: 'bold', color: '#421C00' },
  translationText: { color: '#8E8E8E', fontSize: 13 },
  rightSection: { alignItems: 'flex-end' },
  posTag: { fontSize: 9, color: '#FFB800' },
  starIcon: { width: 16, height: 16, tintColor: '#FFD54F', marginTop: 5 },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyStateText: { color: '#8E8E8E', fontSize: 15, textAlign: 'center' },
  footerNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  selectAllContainer: { flexDirection: 'row', alignItems: 'center' },
  selectAllText: { marginLeft: 10, fontSize: 16, color: '#421C00', fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FF5252', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },
  deleteBtnDisabled: { backgroundColor: '#FFCDD2' },
  deleteBtnText: { color: '#FFF', fontWeight: 'bold' }
});