import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { toggleBookmarkTranslation } from '../../services/translate/bookmarkService';

export const useBookmarkTranslation = (initialBookmarked = false) => {
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsBookmarked(initialBookmarked);
    }, [initialBookmarked]);

    const toggleBookmark = async (translationId) => {
        if (!translationId) return;
        
        setIsLoading(true);
        // Optimistic UI update
        setIsBookmarked(prev => !prev);
        
        try {
            const result = await toggleBookmarkTranslation(translationId);
            
            // Sync with backend if the response returned an explicit boolean state
            if (result && typeof result.bookmarked === 'boolean') {
                setIsBookmarked(result.bookmarked);
            }
        } catch (error) {
            console.error('Bookmark error:', error);
            // Revert state on failure
            setIsBookmarked(prev => !prev);
            Alert.alert('Error', 'Failed to bookmark translation. Please try again.');
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
