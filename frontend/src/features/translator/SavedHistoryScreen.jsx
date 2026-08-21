import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { colors } from '../../shared/theme/colorPalette';
import { useSavedTranslations } from '../../shared/hooks/translate/useSavedTranslations';
import HistoryCard from '../../shared/components/translator/HistoryCard';
import { useRouter } from 'expo-router';

export default function SavedHistoryScreen() {
    const router = useRouter();
    const { savedTranslations, loading, refreshing, onRefresh } = useSavedTranslations();

    const renderItem = ({ item }) => (
        <HistoryCard
            item={item}
            onPress={() => router.push({
                pathname: '/Translator/HistoryDetail',
                params: { itemString: JSON.stringify(item) }
            })}
        />
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={savedTranslations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No saved translations yet. Start bookmarking!</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    list: { paddingBottom: 30 },
    emptyText: {
        textAlign: 'center',
        color: colors.textMuted,
        marginTop: 50,
        fontSize: 16,
    }
});
