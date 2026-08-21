import React from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslationHistory } from '../../shared/hooks/translate/useTranslationHistory';
import HistoryCard from '../../shared/components/translator/HistoryCard';
import { colors } from '../../shared/theme/colorPalette';

export default function TranslationHistoryScreen() {
    const router = useRouter();
    const {
        historySections,
        loading,
        loadingMore,
        refreshing,
        page,
        onRefresh,
        handleLoadMore
    } = useTranslationHistory();

    const renderItem = ({ item }) => (
        <HistoryCard
            item={item}
            onPress={() => router.push({
                pathname: '/Translator/TranslationDetail',
                params: { itemString: JSON.stringify(item) }
            })}
        />
    );

    const renderSectionHeader = ({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    if (loading && page === 0) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.navigationRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                    <Text style={styles.backButtonText}>Translate</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitleAbsolute}>History</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.clearButton}>
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            </View>

            <SectionList
                sections={historySections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.list}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.2}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No translations yet. Start translating!</Text>
                }
                stickySectionHeadersEnabled={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    navigationRow: { marginTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    backButton: { flexDirection: 'row', alignItems: 'center', marginLeft: -4, zIndex: 1 },
    backButtonText: { color: colors.textPrimary, fontSize: 17, marginLeft: 2 },
    headerTitleAbsolute: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, zIndex: 0 },
    clearButton: { zIndex: 1, paddingRight: 4 },
    clearText: { color: colors.textPrimary, fontSize: 17 },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primaryDeep,
        marginTop: 20,
        marginBottom: 10,
    },
    list: { paddingBottom: 30 },
    emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: 50, fontSize: 16 },
    footerLoader: { paddingVertical: 15, alignItems: 'center' }
});
