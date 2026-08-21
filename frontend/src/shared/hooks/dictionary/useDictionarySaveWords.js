import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { dictionaryBookmarkService } from '../../services/dictionary/dictionaryBookmarkService';

export function useDictionarySaveWords() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBookmarks = async (showInitialSpinner = false) => {
    if (showInitialSpinner) setLoading(true);
    try {
      const data = await dictionaryBookmarkService.getSavedWords();
      setBookmarks(data || []);
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

  const processDeletion = async () => {
    setIsDeleting(true);
    try {
      await dictionaryBookmarkService.deleteSavedWords(Array.from(selectedIds));
      setBookmarks(prev => prev.filter(item => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Deletion error:", error);
      Alert.alert("Error", "Failed to delete items.");
    } finally {
      setIsDeleting(false);
    }
  };

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

  return {
    bookmarks,
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
