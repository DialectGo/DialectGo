import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { dictionaryHistoryService } from '../../services/dictionary/dictionaryHistoryService';

export function useDictionaryHistory() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = async (showInitialSpinner = false) => {
    if (showInitialSpinner) setLoading(true);
    try {
      const data = await dictionaryHistoryService.getDictionaryHistory();
      setHistoryItems(data);
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

  const processDeletion = async () => {
    setIsDeleting(true);
    try {
      await dictionaryHistoryService.deleteDictionaryHistory(selectedIds);
      setHistoryItems(prev => prev.filter(item => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Deletion error:", error);
      Alert.alert("Error", "An error occurred during deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

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

  return {
    historyItems,
    loading,
    refreshing,
    selectedIds,
    isDeleting,
    handleRefresh,
    toggleSelect,
    toggleSelectAll,
    confirmDelete
  };
}
