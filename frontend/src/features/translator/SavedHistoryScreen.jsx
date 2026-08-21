import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../shared/theme/colorPalette';

export default function SavedHistoryScreen() {
    // Placeholder for actual saved translations fetch hook
    const loading = false;

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.emptyText}>No saved translations yet. Start bookmarking!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textMuted,
        marginTop: 50,
        fontSize: 16,
    }
});
