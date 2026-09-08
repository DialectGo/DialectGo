import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../api/supabase';
import { useToast } from '../../context/ToastContext';
import { dictionaryHistoryService } from '../../services/dictionary/dictionaryHistoryService';

export function useDictionaryHistory() {
  const { showToast } = useToast();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = async (showInitialSpinner = false) => {
    let cacheKey = 'dialectgo_dict_history_fallback';
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) cacheKey = `dialectgo_dict_history_${session.user.id}`;
      
      if (showInitialSpinner) {
        const cachedStr = await AsyncStorage.getItem(cacheKey);
        if (cachedStr) {
          setHistoryItems(JSON.parse(cachedStr));
          setLoading(false); // Instantly hide spinner if cache exists
        } else {
          setLoading(true);
        }
      }
    } catch (e) {
      if (showInitialSpinner) setLoading(true);
    }

    try {
      const data = await dictionaryHistoryService.getDictionaryHistory();
      setHistoryItems(data);
      AsyncStorage.setItem(cacheKey, JSON.stringify(data)).catch(() => {});
    } catch (error) {
      console.error("Error loading history from API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setSelectedIds(new Set());
    await fetchHistory(false);
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
    if (selectedIds.size === historyItems.length && historyItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(historyItems.map(item => item.id)));
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const processDeletion = async () => {
    setIsDeleting(true);
    try {
      await dictionaryHistoryService.deleteDictionaryHistory(selectedIds);
      setHistoryItems(prev => prev.filter(item => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
      setShowConfirmModal(false);
      showToast('Items successfully deleted', 'success', 'Success');
    } catch (error) {
      console.error("Deletion error:", error);
      showToast("An error occurred during deletion.", 'error', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (selectedIds.size === 0) return;
    setShowConfirmModal(true);
  };

  return {
    historyItems,
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
