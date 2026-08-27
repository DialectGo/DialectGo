import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Clipboard, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../shared/theme/colorPalette';
import { LANGUAGES } from '../../shared/hooks/translate/constants';
import { styles as translateStyles } from './styles/TranslateStyles';
import { useTranslationAudio } from '../../shared/hooks/translate/useTranslationAudio';
import { useTranslationFeedback } from '../../shared/hooks/translate/useTranslationFeedback';
import { useTranslationMeta } from '../../shared/hooks/translate/useTranslationMeta';
import { useBookmarkTranslation } from '../../shared/hooks/translate/useBookmarkTranslation';

import ContributionModal from '../../shared/components/wiki/ContributionModal';
import LoadingModal from '../../shared/components/LoadingModal';
import CustomizeModal from '../../shared/components/CustomizeModal';
import TranslateActionSheets from '../../shared/components/translate/TranslateActionSheets';
import BreakdownPanel from '../../shared/components/translate/BreakdownPanel';

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

    const [localTranslation, setLocalTranslation] = useState(item.translated_text);
    
    // Modal states
    const [rateModalVisible, setRateModalVisible] = useState(false);
    const [moreMenuVisible, setMoreMenuVisible] = useState(false);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

    // Bookmark hook
    const { isBookmarked, toggleBookmark } = useBookmarkTranslation(item.is_bookmarked);

    // Audio hook
    const { playTranslatedAudio, isPlayingAudio } = useTranslationAudio();

    // Feedback hook
    const {
        feedback,
        setFeedback,
        comment,
        setComment,
        suggestionText,
        setSuggestionText,
        handleQuickRating,
        handleDetailedSubmit
    } = useTranslationFeedback({
        currentTranslationId: item.id,
        inputText: item.source_text,
        sourceLang: sourceLangName,
        targetLang: targetLangName,
    });

    // Meta hook (Customize/Breakdown)
    const {
        breakdownData,
        setBreakdownData,
        isBreakdownLoading,
        handleShowBreakdown,
        isCustomizeLoading,
        handleCustomizeSubmit,
        showCustomize,
        setShowCustomize,
        breakdownPanelVisible,
        setBreakdownPanelVisible
    } = useTranslationMeta({
        inputText: item.source_text,
        translation: localTranslation,
        setTranslation: setLocalTranslation,
        sourceLang: sourceLangName,
        targetLang: targetLangName,
        targetDialect: null,
    });

    const handleCopy = () => {
        if (!localTranslation) return;
        Clipboard.setString(localTranslation);
        Alert.alert('Copied!', 'Translation copied to clipboard.');
    };

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
                        <TouchableOpacity style={styles.headerIcon} onPress={() => toggleBookmark(item.id)}>
                            <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={24} color={isBookmarked ? colors.primary : colors.textPrimary} />
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
                            <Text style={[translateStyles.resultText, { fontSize: 16 }]} selectable>{localTranslation}</Text>

                            <View style={translateStyles.outputToolbar}>
                                {!isDocumentOrImage && (
                                    <TouchableOpacity style={translateStyles.outputToolbarBtn} onPress={() => playTranslatedAudio(localTranslation, targetLangName)}>
                                        <Ionicons name={isPlayingAudio ? "volume-high" : "volume-medium-outline"} size={20} color={isPlayingAudio ? "#FBBF24" : "#1F2937"} />
                                    </TouchableOpacity>
                                )}

                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {!isDocumentOrImage && (
                                        <TouchableOpacity style={[translateStyles.outputToolbarBtn, { marginRight: 10 }]} onPress={handleCopy}>
                                            <Ionicons name="copy-outline" size={20} color="#1F2937" />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={[translateStyles.outputToolbarBtn, { marginRight: 10 }]} onPress={() => setRateModalVisible(true)}>
                                        <MaterialIcons name="thumbs-up-down" size={20} color={feedback ? '#FBBF24' : '#1F2937'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={translateStyles.outputToolbarBtn} onPress={() => setMoreMenuVisible(true)}>
                                        <Ionicons name="ellipsis-horizontal" size={20} color="#1F2937" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    {breakdownData && !isBreakdownLoading && (
                        <TouchableOpacity 
                            style={translateStyles.reviewBreakdownBtn} 
                            onPress={() => setBreakdownPanelVisible(true)}
                        >
                            <Ionicons name="bulb" size={20} color="#F59E0B" />
                            <Text style={translateStyles.reviewBreakdownText}>Review AI Breakdown</Text>
                        </TouchableOpacity>
                    )}

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

            {/* Interactive Modals */}
            <LoadingModal visible={isBreakdownLoading} message="Analyzing translation..." />
            
            <TranslateActionSheets
                rateModalVisible={rateModalVisible}
                setRateModalVisible={setRateModalVisible}
                handleQuickRating={handleQuickRating}
                feedback={feedback}
                moreMenuVisible={moreMenuVisible}
                setMoreMenuVisible={setMoreMenuVisible}
                setFeedbackModalVisible={setFeedbackModalVisible}
                handleShowBreakdown={handleShowBreakdown}
                setShowCustomize={setShowCustomize}
                modalVisible={false}
                setModalVisible={() => {}}
                selectingFor="source"
                sourceLang={sourceLangName}
                targetLang={targetLangName}
                selectLanguage={() => {}}
            />

            <ContributionModal
                visible={feedbackModalVisible}
                onClose={() => setFeedbackModalVisible(false)}
                onSubmit={handleDetailedSubmit}
                feedbackComment={comment}
                setFeedbackComment={setComment}
                suggestedTranslation={suggestionText}
                setSuggestedTranslation={setSuggestionText}
            />

            <CustomizeModal
                visible={showCustomize}
                onClose={() => setShowCustomize(false)}
                onSubmit={handleCustomizeSubmit}
                isLoading={isCustomizeLoading}
            />

            {breakdownData && (
                <BreakdownPanel
                    visible={breakdownPanelVisible}
                    onClose={() => setBreakdownPanelVisible(false)}
                    breakdown={breakdownData}
                    isLoading={isBreakdownLoading}
                    onSelectAlternative={(text) => {
                        setLocalTranslation(text);
                        setBreakdownData(null);
                        setBreakdownPanelVisible(false);
                    }}
                />
            )}
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
