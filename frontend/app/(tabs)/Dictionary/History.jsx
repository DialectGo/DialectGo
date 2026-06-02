import React, { useEffect, useState, useCallback } from 'react';
import {
  Image,
  SafeAreaView,
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
import { endpoints } from '../../../shared/config/apiConfig';

// Use centralized API endpoints
const API_BASE = endpoints.DICTIONARY_BASE;

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ✅ STATE FOR PULL-TO-REFRESH
  const [selectedIds, setSelectedIds] = useState(new Set()); // Track selections
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Load history on mount
  useEffect(() => {
    fetchHistory(true); // show full-screen spinner on first mount
  }, []);

  const fetchHistory = async (showInitialSpinner = false) => {
    if (showInitialSpinner) setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const response = await fetch(endpoints.DICTIONARY_HISTORY, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success && result.data) {
        setHistoryItems(result.data);
      } else {
        setHistoryItems([]);
      }
    } catch (error) {
      console.error("Error loading history from API:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ PULL-TO-REFRESH LIFECYCLE CALLBACK HANDLER
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Keep selections unless items are wiped, or reset it safely to prevent array bugs
    setSelectedIds(new Set());
    await fetchHistory(false); // pass false so the RefreshControl handles the loader UI
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
    if (selectedIds.size === historyItems.length && historyItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(historyItems.map(item => item.id)));
    }
  };

  // Handle Delete with Confirmation Modal
  const confirmDelete = () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete ${selectedIds.size} history item(s)?`,
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
      
      const response = await fetch(endpoints.DICTIONARY_HISTORY_DELETE, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });

      if (response.ok) {
        setHistoryItems(prev => prev.filter(item => !selectedIds.has(item.id)));
        setSelectedIds(new Set());
      } else {
        Alert.alert("Error", "Failed to delete history items.");
      }
    } catch (error) {
      console.error("Deletion error:", error);
      Alert.alert("Error", "An error occurred during deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderItem = (item, index) => {
    const isSelected = selectedIds.has(item.id);
    
    return (
      <View key={item.id?.toString() || index.toString()} style={styles.cardContainer}>
        {/* Checkbox Section */}
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => toggleSelect(item.id)}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
            {isSelected && <View style={styles.checkboxInner} />}
          </View>
        </TouchableOpacity>

        {/* History Item Card */}
        <TouchableOpacity 
          activeOpacity={0.7}
          style={styles.historyCard} 
          onPress={() => {
            router.push(`/Dictionary/Search?term=${item.search_term}`);
          }} 
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.wordText}>{item.search_term}</Text>
            <Text style={styles.timeText}>
              {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Image 
            source={require('../../../assets/icons/back_arrow.png')} 
            style={styles.arrowIcon} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <Image source={require('../../../assets/icons/back_arrow.png')} style={styles.backImg} />
        </TouchableOpacity>
        <Text style={styles.title}>Recent History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* LIST / LOADING SECTION WRAPPED IN THE REFRESH CONTAINER */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD54F" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <RefreshContainer
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={styles.listPadding}
          >
            {historyItems.length > 0 ? (
              // ✅ MAPPED RENDERING PREVENTS FLATLIST WITHIN SCROLLVIEW COMPATIBILITY CRASHES
              <View style={{ paddingBottom: 40 }}>
                {historyItems.map((item, index) => renderItem(item, index))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Image 
                  source={require('../../../assets/icons/back_arrow.png')} 
                  style={[styles.emptyIcon, { opacity: 0.2 }]} 
                />
                <Text style={styles.emptyText}>No recent searches yet.</Text>
              </View>
            )}
          </RefreshContainer>

          {/* FOOTER FIXED SELECTION NAVIGATION */}
          {historyItems.length > 0 && (
            <View style={styles.footerNav}>
              <TouchableOpacity style={styles.selectAllContainer} onPress={toggleSelectAll}>
                <View style={[
                  styles.checkbox, 
                  selectedIds.size === historyItems.length && historyItems.length > 0 && styles.checkboxActive
                ]}>
                  {selectedIds.size === historyItems.length && historyItems.length > 0 && (
                    <View style={styles.checkboxInner} />
                  )}
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
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backBtn: { padding: 5 },
  backImg: { width: 22, height: 22, tintColor: '#421C00' },
  title: { 
    fontSize: 22, 
    fontFamily: 'Poppins-Bold', 
    color: '#FFB800' 
  },
  listPadding: { 
    paddingHorizontal: 20,
    paddingBottom: 120, // Expanded padding to clear space above footer controls cleanly
    paddingTop: 10,
    flexGrow: 1
  },
  cardContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  checkboxContainer: { paddingRight: 10 },
  checkbox: { 
    width: 22, 
    height: 22, 
    borderWidth: 2, 
    borderColor: '#FFB800', 
    borderRadius: 6, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  checkboxActive: { backgroundColor: '#FFB800' },
  checkboxInner: { width: 10, height: 10, backgroundColor: '#FFF', borderRadius: 2 },
  historyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  wordText: { 
    fontSize: 18, 
    fontFamily: 'Poppins-Bold', 
    color: '#421C00' 
  },
  timeText: { 
    fontSize: 12, 
    color: '#8E8E8E', 
    fontFamily: 'Poppins-Regular',
    marginTop: 2
  },
  arrowIcon: { 
    width: 16, 
    height: 16, 
    transform: [{ rotate: '180deg' }], 
    tintColor: '#FFD54F' 
  },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 60, // Better center layout when rendering empty inside the container
    paddingHorizontal: 40 
  },
  emptyIcon: { width: 50, height: 50, marginBottom: 15 },
  emptyText: { 
    color: '#ADB5BD', 
    fontFamily: 'Poppins-Medium',
    fontSize: 16 
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
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
  selectAllText: { marginLeft: 10, fontSize: 16, color: '#421C00', fontFamily: 'Poppins-Bold' },
  deleteBtn: { backgroundColor: '#FF5252', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 },
  deleteBtnDisabled: { backgroundColor: '#FFCDD2' },
  deleteBtnText: { color: '#FFF', fontFamily: 'Poppins-Bold' }
});