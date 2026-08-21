import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../shared/theme/colorPalette';
import { LANGUAGES } from '../../shared/hooks/translate/constants';
import { styles as translateStyles } from './styles/TranslateStyles';

export default function HistoryDetailScreen() {
    const router = useRouter();
    const { itemString } = useLocalSearchParams();
    const item = itemString ? JSON.parse(itemString) : null;

    if (!item) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Translation details not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const sourceLang = LANGUAGES.find(l => l.id == item.source_language_id);
    const targetLang = LANGUAGES.find(l => l.id == item.target_language_id);

    const sourceLangName = item.source_lang?.name || sourceLang?.name || item.source_language_id || 'Unknown';
    const targetLangName = item.target_lang?.name || targetLang?.name || item.target_language_id || 'Unknown';

    const isDocumentOrImage = item.source_type === 'document' || item.source_type === 'image';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
                        <Text style={styles.headerHome}>Home</Text>
                    </TouchableOpacity>

                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.headerIcon}>
                            <Ionicons name="bookmark-outline" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Source Section */}
                    <View style={translateStyles.translateCard}>
                        <View style={translateStyles.cardHeader}>
                            <Text style={translateStyles.inputLabel}>{sourceLangName.toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[translateStyles.mainInput, { fontSize: 16 }]} selectable>{item.source_text}</Text>
                        </View>

                        {/* No footer for source card in history, just like TranslateScreen which only has inputs there */}
                    </View>

                    {/* Target Section */}
                    <View style={[translateStyles.translateCard, translateStyles.resultCardExtra]}>
                        <View style={translateStyles.cardHeader}>
                            <Text style={translateStyles.inputLabel}>{targetLangName.toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[translateStyles.resultText, { fontSize: 16 }]} selectable>{item.translated_text}</Text>

                            <View style={translateStyles.outputToolbar}>
                                {!isDocumentOrImage && (
                                    <TouchableOpacity style={translateStyles.outputToolbarBtn}>
                                        <Ionicons name="volume-medium-outline" size={20} color="#1F2937" />
                                    </TouchableOpacity>
                                )}

                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {!isDocumentOrImage && (
                                        <TouchableOpacity style={[translateStyles.outputToolbarBtn, { marginRight: 10 }]}>
                                            <Ionicons name="copy-outline" size={20} color="#1F2937" />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={[translateStyles.outputToolbarBtn, { marginRight: 10 }]}>
                                        <MaterialIcons name="thumbs-up-down" size={20} color="#1F2937" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={translateStyles.outputToolbarBtn}>
                                        <Ionicons name="ellipsis-horizontal" size={20} color="#1F2937" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Optional spacing at bottom */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* FAB */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/Translator/Translate')}
                >
                    <Ionicons name="add" size={24} color={colors.textPrimary} />
                    <Text style={styles.fabText}>New translation</Text>
                </TouchableOpacity>

                {/* Bottom Bar */}
                <View style={styles.bottomBar}>
                    <View style={styles.bottomBarInner}>
                        <Text style={styles.bottomBarText}>{sourceLangName}</Text>
                        <Ionicons name="swap-horizontal" size={20} color={colors.textSecondary} style={{ marginHorizontal: 15 }} />
                        <Text style={styles.bottomBarText}>{targetLangName}</Text>
                    </View>
                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    errorText: { color: colors.textPrimary, fontSize: 16, marginBottom: 20 },
    backBtn: { padding: 10, backgroundColor: colors.primary, borderRadius: 8 },
    backBtnText: { color: colors.textPrimary, fontWeight: 'bold' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerBtn: { flexDirection: 'row', alignItems: 'center' },
    headerHome: { color: colors.textPrimary, fontSize: 17, marginLeft: -2 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    headerIcon: { marginLeft: 20 },

    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    langName: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 20,
    },
    sourceText: {
        color: colors.textPrimary,
        fontSize: 22,
        lineHeight: 32,
        marginBottom: 30,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    actionIcon: {
        padding: 5,
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginBottom: 20,
    },
    langNameTarget: {
        color: colors.primaryDeep,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 20,
    },
    targetText: {
        color: colors.primaryDeep,
        fontSize: 22,
        lineHeight: 32,
        marginBottom: 30,
    },

    fab: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        elevation: 5,
        shadowColor: colors.shadowGold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    fabText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },

    bottomBar: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    bottomBarInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderLight,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 2,
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bottomBarText: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    }
});
