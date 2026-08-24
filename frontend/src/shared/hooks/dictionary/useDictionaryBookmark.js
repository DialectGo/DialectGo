import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useToast } from '../../context/ToastContext';
import { dictionaryBookmarkService } from '../../services/dictionary/dictionaryBookmarkService';

export function useDictionaryBookmark(id, isGuestMode, isConnected, wordTerm) {
  const { showToast } = useToast();
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
      showToast('ID is missing.', 'error', 'Error');
      return;
    }

    if (!isConnected) {
      showToast(
        'You need an internet connection to save words.',
        'error',
        'Network Offline'
      );
      return;
    }

    setIsSaving(true);

    try {
      const newStatus = await dictionaryBookmarkService.saveWordBookmark(id);
      setIsBookmarked(newStatus);
      if (newStatus) {
        showToast(`"${wordTerm}" has been added to your saved words.`, 'success', 'Saved!');
      } else {
        showToast(`"${wordTerm}" has been removed from your saved words.`, 'info', 'Removed');
      }
    } catch (error) {
      showToast(error.message, 'error', 'Error');
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
