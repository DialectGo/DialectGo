import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { fetchSavedTranslations } from '../../services/translate/bookmarkService';

export const useSavedTranslations = () => {
    const [savedTranslations, setSavedTranslations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadBookmarks = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const data = await fetchSavedTranslations();
            setSavedTranslations(data);
        } catch (error) {
            console.error('Fetch Saved Translations Error:', error.message);
            Alert.alert('Error', 'Failed to load saved translations. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadBookmarks();
    }, [loadBookmarks]);

    const onRefresh = () => {
        loadBookmarks(true);
    };

    return {
        savedTranslations,
        loading,
        refreshing,
        onRefresh,
    };
};
