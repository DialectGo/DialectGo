import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { supabase } from '../../../shared/lib/supabase';
import { API_API_BASE } from '../../../shared/config/apiConfig';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Ensure you have React Navigation installed

const API_BASE_URL = API_API_BASE;
const PAGE_SIZE = 10;

export default function History() {
    const navigation = useNavigation();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchHistory = async (pageNumber = 0, shouldRefresh = false) => {
        try {
            if (pageNumber === 0) setLoading(true);
            
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                Alert.alert("Session Expired", "Please log in again.");
                return;
            }

            // Append pagination query parameters to match backend adjustments
            const response = await fetch(`${API_BASE_URL}/history?page=${pageNumber}&limit=${PAGE_SIZE}`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${session.access_token}`,
                    'Accept': 'application/json' 
                }
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const textError = await response.text();
                console.error("Backend returned non-JSON:", textError);
                throw new Error("Server error: Technical issues with the history service.");
            }

            const jsonResponse = await response.json();
            
            // FIX: Extracts the 'data' array from the backend response wrapper payload
            const records = jsonResponse.success && Array.isArray(jsonResponse.data) ? jsonResponse.data : [];

            if (shouldRefresh || pageNumber === 0) {
                setHistory(records);
                setHasMore(records.length === PAGE_SIZE);
            } else {
                setHistory(prev => [...prev, ...records]);
                setHasMore(records.length === PAGE_SIZE);
            }
        } catch (error) {
            console.error("Fetch History Error:", error.message);
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHistory(0);
    }, []);

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

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.content}>
                <View style={styles.langRow}>
                    {/* Fallback to code/language strings safely if relation sub-objects exist */}
                    <Text style={styles.langLabel}>{item.source_lang?.code || item.source_language_id || 'Unknown'}</Text>
                    {/* Yellow Arrow Icon */}
                    <Ionicons name="arrow-forward" size={12} color="#FFCC00" style={{ marginHorizontal: 4 }} />
                    <Text style={styles.langLabel}>{item.target_lang?.code || item.target_language_id || 'Unknown'}</Text>
                </View>
                <Text style={styles.sourceText}>{item.source_text}</Text>
                <Text style={styles.translatedText}>{item.translated_text}</Text>
            </View>
            {/* Bookmark button has been removed from here */}
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#FFCC00" />
            </View>
        );
    };

    if (loading && page === 0) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#FFCC00" />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Top Navigation Row featuring the Yellow Back Button */}
            <View style={styles.navigationRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#FFCC00" />
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            </View>

            {/* Header Row featuring the Yellow Refresh Button */}
            <View style={styles.headerRow}>
                <Text style={styles.header}>History</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh" size={24} color="#FFCC00" />
                </TouchableOpacity>
            </View>
            
            <FlatList 
                data={history}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.2}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFCC00" />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No translations yet. Start translating!</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    navigationRow: { marginTop: 40, flexDirection: 'row', alignItems: 'center' },
    backButton: { flexDirection: 'row', alignItems: 'center', marginLeft: -4 },
    backButtonText: { color: '#FFCC00', fontSize: 17, marginLeft: 2 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 20 },
    header: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 15, 
        padding: 16, 
        flexDirection: 'row', 
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    content: { flex: 1 },
    langRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    langLabel: { fontSize: 11, fontWeight: '700', color: '#FFCC00', textTransform: 'uppercase' },
    sourceText: { fontSize: 16, color: '#333', marginBottom: 4 },
    translatedText: { fontSize: 17, color: '#000', fontWeight: '600' },
    list: { paddingBottom: 30 },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 },
    footerLoader: { paddingVertical: 15, alignItems: 'center' }
});