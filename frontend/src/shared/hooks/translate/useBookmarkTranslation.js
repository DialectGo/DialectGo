import { useState, useEffect } from 'react';
import { toggleBookmarkTranslation } from '../../services/translate/bookmarkService';
import { useToast } from '../../context/ToastContext';

export const useBookmarkTranslation = (initialBookmarked = false) => {
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        setIsBookmarked(initialBookmarked);
    }, [initialBookmarked]);

    const toggleBookmark = async (translationId, wordText = 'Translation') => {
        if (!translationId) return;
        
        setIsLoading(true);
        const originalState = isBookmarked;
        const newState = !originalState;
        
        // Truncate word for UI
        const shortWord = wordText.length > 20 ? wordText.substring(0, 20) + '...' : wordText;
        
        // Optimistic UI update
        setIsBookmarked(newState);
        
        try {
            const result = await toggleBookmarkTranslation(translationId);
            
            // Sync with backend if the response returned an explicit boolean state
            let finalState = newState;
            if (result && typeof result.bookmarked === 'boolean') {
                finalState = result.bookmarked;
                setIsBookmarked(finalState);
            }

            if (finalState) {
                showToast(`"${shortWord}" bookmarked!`, 'success', 'Saved');
            } else {
                showToast(`"${shortWord}" removed`, 'info', 'Removed');
            }
        } catch (error) {
            console.error('Bookmark error:', error);
            // Revert state on failure
            setIsBookmarked(originalState);
            showToast('Failed to update bookmark. Please try again.', 'error', 'Error');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isBookmarked,
        isLoading,
        toggleBookmark,
        setIsBookmarked
    };
};
