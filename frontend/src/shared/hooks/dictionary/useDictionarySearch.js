import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { searchDictionary } from '../../services/dictionary/dictionarySearchService';

export const useDictionarySearch = () => {
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        let timeout;



        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const handleSearch = async (term) => {
            setLoading(true);
            setError(null);

            try {
                const results = await searchDictionary(term);
                setSearchResults(results);
            } catch (err) {
                if (err.message.includes('Authentication Required')) {
                    showToast('Please log in to search.', 'error', 'Authentication Required');
                } else {
                    setError('Could not connect to the server.');
                }
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        };

        timeout = setTimeout(() => {
            handleSearch(searchQuery.trim());
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleRefresh = useCallback(async (refreshBrowseDataCallback) => {
        setRefreshing(true);
        setError(null);

        try {
            if (searchQuery.trim()) {
                // Manually trigger search again
                setLoading(true);
                const results = await searchDictionary(searchQuery.trim());
                setSearchResults(results);
                setLoading(false);
            } else if (refreshBrowseDataCallback) {
                await refreshBrowseDataCallback();
            }
        } catch (err) {
            console.error('Refresh failure:', err);
        } finally {
            setRefreshing(false);
        }
    }, [searchQuery]);

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        loading,
        error,
        refreshing,
        handleRefresh
    };
};
