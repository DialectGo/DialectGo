import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslationHistory } from '../../shared/hooks/translator/useTranslationHistory';

export default function TranslationHistoryScreen() {
    const router = useRouter();
    const {
        history,
        loading,
        loadingMore,
        refreshing,
        page,
        onRefresh,
        handleLoadMore
    } = useTranslationHistory();

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.content}>
                <View style={styles.langRow}>
                    <Text style={styles.langLabel}>{item.source_lang?.code || item.source_language_id || 'Unknown'}</Text>
                    <Ionicons name="arrow-forward" size={12} color="#FFCC00" style={{ marginHorizontal: 4 }} />
                    <Text style={styles.langLabel}>{item.target_lang?.code || item.target_language_id || 'Unknown'}</Text>
                </View>
                <Text style={styles.sourceText}>{item.source_text}</Text>
                <Text style={styles.translatedText}>{item.translated_text}</Text>
            </View>
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
            <View style={styles.navigationRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#FFCC00" />
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            </View>

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
