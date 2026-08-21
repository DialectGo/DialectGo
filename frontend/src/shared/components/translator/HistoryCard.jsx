import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colorPalette'; // relative to shared/components/translator

import { useBookmarkTranslation } from '../../hooks/translate/useBookmarkTranslation';

export default function HistoryCard({ item, onPress }) {
    const { isBookmarked, toggleBookmark, isLoading } = useBookmarkTranslation(item.is_bookmarked || false);

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
            <TouchableOpacity 
                style={styles.bookmarkButton} 
                onPress={() => toggleBookmark(item.id)}
                disabled={isLoading}
            >
                <Ionicons 
                    name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                    size={24} 
                    color={isBookmarked ? colors.primary : colors.textMuted} 
                />
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
