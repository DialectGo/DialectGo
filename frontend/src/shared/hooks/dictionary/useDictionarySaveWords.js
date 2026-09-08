import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../api/supabase';
import { useToast } from '../../context/ToastContext';
import { dictionaryBookmarkService } from '../../services/dictionary/dictionaryBookmarkService';

export function useDictionarySaveWords() {
  const { showToast } = useToast();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBookmarks = async (showInitialSpinner = false) => {
    let cacheKey = 'dialectgo_dict_bookmarks_fallback';
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) cacheKey = `dialectgo_dict_bookmarks_${session.user.id}`;
      
      if (showInitialSpinner) {
        const cachedStr = await AsyncStorage.getItem(cacheKey);
        if (cachedStr) {
          setBookmarks(JSON.parse(cachedStr));
          setLoading(false); // Instantly hide spinner if cache exists
        } else {
          setLoading(true);
        }
      }
    } catch (e) {
      if (showInitialSpinner) setLoading(true);
    }

    try {
      const data = await dictionaryBookmarkService.getSavedWords();
      setBookmarks(data || []);
      AsyncStorage.setItem(cacheKey, JSON.stringify(data || [])).catch(() => {});
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setSelectedIds(new Set());
    await fetchBookmarks(false);
    setRefreshing(false);
  }, []);

  const toggleSelect = (id) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === bookmarks.length && bookmarks.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bookmarks.map(item => item.id)));
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const processDeletion = async () => {
    setIsDeleting(true);
    try {
      await dictionaryBookmarkService.deleteSavedWords(Array.from(selectedIds));
      setBookmarks(prev => prev.filter(item => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
      setShowConfirmModal(false);
      showToast('Items successfully deleted', 'success', 'Success');
    } catch (error) {
      console.error("Deletion error:", error);
      showToast("Failed to delete items.", 'error', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (selectedIds.size === 0) return;
    setShowConfirmModal(true);
  };

  return {
    bookmarks,
    loading,
    refreshing,
    selectedIds,
    isDeleting,
    handleRefresh,
    toggleSelect,
    toggleSelectAll,
    confirmDelete,
    showConfirmModal,
    setShowConfirmModal,
    processDeletion
  };
}
