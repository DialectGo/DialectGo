import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert } from 'react-native';
import { fetchHistory as fetchHistoryService } from '../../services/historyService';

const PAGE_SIZE = 10;

export const useTranslationHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchHistory = async (pageNumber = 0, shouldRefresh = false) => {
        try {
            if (pageNumber === 0) setLoading(true);

            const records = await fetchHistoryService(pageNumber, PAGE_SIZE);

            if (shouldRefresh || pageNumber === 0) {
                setHistory(records);
                setHasMore(records.length === PAGE_SIZE);
            } else {
                setHistory(prev => [...prev, ...records]);
                setHasMore(records.length === PAGE_SIZE);
            }
        } catch (error) {
            console.error('Fetch History Error:', error.message);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchHistory(0);
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(0);
        fetchHistory(0, true);
    }, []);

    const handleLoadMore = () => {
        if (!hasMore || loadingMore || loading) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHistory(nextPage);
    };

    const historySections = React.useMemo(() => {
        const sections = {};
        history.forEach(record => {
            const date = record.created_at ? new Date(record.created_at) : new Date();
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            const dateString = date.toLocaleDateString('en-US', options);
            if (!sections[dateString]) {
                sections[dateString] = [];
            }
            sections[dateString].push(record);
        });
        return Object.keys(sections).map(title => ({ title, data: sections[title] }));
    }, [history]);

    return {
        history,
        historySections,
        loading,
        loadingMore,
        refreshing,
        page,
        onRefresh,
        handleLoadMore
    };
};
