import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { dictionaryBookmarkService } from '../../services/dictionary/dictionaryBookmarkService';

export function useDictionaryBookmark(id, isGuestMode, isConnected, wordTerm) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const verifyBookmarkStatus = async () => {
    if (!id || isGuestMode || !isConnected) return;
    
    try {
      const status = await dictionaryBookmarkService.checkBookmarkStatus(id);
      setIsBookmarked(status);
    } catch (error) {
      console.error('Failed to fetch initial word bookmark state:', error);
    }
  };

  useEffect(() => {
    verifyBookmarkStatus();
  }, [id, isGuestMode, isConnected]);

  const handleSaveWord = async () => {
    if (!id) {
      Alert.alert('Error', 'ID is missing.');
      return;
    }

    if (!isConnected) {
      Alert.alert(
        'Network Offline',
        'You need an internet connection to save words.'
      );
      return;
    }

    setIsSaving(true);

    try {
      await dictionaryBookmarkService.saveWordBookmark(id);
      setIsBookmarked(true);
      Alert.alert('Saved!', `"${wordTerm}" has been added to your saved words.`);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isBookmarked,
    isSaving,
    verifyBookmarkStatus,
    handleSaveWord,
  };
}
