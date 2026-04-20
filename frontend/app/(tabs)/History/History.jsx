import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { supabase } from '../../../shared/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = 'http://192.168.1.50:5001/api';

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                Alert.alert("Session Expired", "Please log in again.");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/history`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${session.access_token}`,
                    'Accept': 'application/json' 
                }
            });

            // Check if response is actually JSON before parsing
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const textError = await response.text();
                console.error("Backend returned non-JSON:", textError);
                throw new Error("Server error: Technical issues with the history service.");
            }

            const data = await response.json();
            setHistory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Fetch History Error:", error.message);
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchHistory();
    }, []);

    const toggleBookmark = async (translationId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${API_BASE_URL}/bookmark`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}` 
                },
                body: JSON.stringify({ translationId }),
            });

            if (response.ok) {
                // Locally update the UI for better UX
                fetchHistory();
            }
        } catch (error) {
            console.error("Bookmark error:", error);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.content}>
                <View style={styles.langRow}>
                    <Text style={styles.langLabel}>{item.source_lang}</Text>
                    <Ionicons name="arrow-forward" size={12} color="#888" style={{ marginHorizontal: 4 }} />
                    <Text style={styles.langLabel}>{item.target_lang}</Text>
                </View>
                <Text style={styles.sourceText}>{item.source_text}</Text>
                <Text style={styles.translatedText}>{item.translated_text}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleBookmark(item.id)} style={styles.bookmarkBtn}>
                <Ionicons 
                    name={item.is_bookmarked ? "bookmark" : "bookmark-outline"} 
                    size={24} 
                    color="#007AFF" 
                />
            </TouchableOpacity>
        </View>
    );

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>History</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>
            
            <FlatList 
                data={history}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 20 },
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
    langLabel: { fontSize: 11, fontWeight: '700', color: '#007AFF', textTransform: 'uppercase' },
    sourceText: { fontSize: 16, color: '#333', marginBottom: 4 },
    translatedText: { fontSize: 17, color: '#000', fontWeight: '600' },
    bookmarkBtn: { padding: 8 },
    list: { paddingBottom: 30 },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 }
});