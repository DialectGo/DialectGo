import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colorPalette'; // relative to shared/components/translator

export default function HistoryCard({ item, onPress }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.content}>
                <Text style={styles.sourceText} numberOfLines={2}>
                    {item.source_text?.trim().replace(/\s+/g, ' ')}
                </Text>
                <Text style={styles.translatedText} numberOfLines={2}>
                    {item.translated_text?.trim().replace(/\s+/g, ' ')}
                </Text>
            </View>
            <TouchableOpacity style={styles.bookmarkButton}>
                <Ionicons name="bookmark-outline" size={24} color={colors.textMuted} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface, 
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        paddingVertical: 16,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 8,
        marginBottom: 8,
    },
    content: {
        flex: 1,
        paddingRight: 16,
    },
    sourceText: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    translatedText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    bookmarkButton: {
        padding: 8,
    }
});
