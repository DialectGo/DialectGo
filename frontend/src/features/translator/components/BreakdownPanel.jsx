/**
 * BreakdownPanel — Expandable accordion that renders LLM breakdown reports.
 * 
 * Sections:
 * 1. Word-by-Word Analysis (table)
 * 2. Sentiment & Context (badge + explanation)
 * 3. Sentence Construction (structural analysis)
 * 4. Alternative Suggestions (tappable chips)
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    LayoutAnimation,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SwipeableBottomSheet from '../../../shared/components/SwipeableBottomSheet';

// ─── Tone Emoji Map ─────────────────────────────────────────────────────────
const TONE_EMOJI = {
    'romantic': '🥰',
    'flirty': '😏',
    'casual': '😎',
    'formal': '🎩',
    'angry': '😤',
    'playful': '😜',
    'neutral': '😐',
    'sad': '😢',
    'happy': '😊',
    'respectful': '🙏',
};

function getToneEmoji(tone) {
    if (!tone) return '🔍';
    const key = tone.toLowerCase().split(/[\s\/]/)[0]; // "Romantic / Flirty" → "romantic"
    return TONE_EMOJI[key] || '🔍';
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function SectionHeader({ title, icon, isOpen, onToggle }) {
    return (
        <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
            <View style={styles.sectionHeaderLeft}>
                <Ionicons name={icon} size={18} color="#FBBF24" />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#9CA3AF"
            />
        </TouchableOpacity>
    );
}

function WordByWordSection({ words }) {
    if (!words || words.length === 0) return null;

    return (
        <View style={styles.sectionContent}>
            {words.map((entry, index) => (
                <View key={index} style={styles.wordCard}>
                    <View style={styles.wordPairRow}>
                        <Text style={styles.sourceWord}>{entry.sourceWord}</Text>
                        <Ionicons name="arrow-forward" size={14} color="#9CA3AF" />
                        <Text style={styles.translatedWord}>{entry.translatedWord}</Text>
                        <View style={styles.posBadge}>
                            <Text style={styles.posText}>{entry.partOfSpeech}</Text>
                        </View>
                    </View>
                    {entry.morphology && (
                        <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Morphology: </Text>
                            {entry.morphology}
                        </Text>
                    )}
                    {entry.usage && (
                        <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Usage: </Text>
                            {entry.usage}
                        </Text>
                    )}
                    {entry.dialectNote && (
                        <View style={styles.dialectNoteContainer}>
                            <Ionicons name="location-outline" size={12} color="#8B5CF6" />
                            <Text style={styles.dialectNoteText}>{entry.dialectNote}</Text>
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
}

function SentimentSection({ sentiment }) {
    if (!sentiment) return null;

    const emoji = getToneEmoji(sentiment.detectedTone);
    const confidence = Math.round((sentiment.confidenceScore || 0) * 100);

    return (
        <View style={styles.sectionContent}>
            <View style={styles.sentimentRow}>
                <View style={styles.toneBadge}>
                    <Text style={styles.toneEmoji}>{emoji}</Text>
                    <Text style={styles.toneLabel}>{sentiment.detectedTone}</Text>
                </View>
                <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{confidence}%</Text>
                </View>
            </View>
            {sentiment.explanation && (
                <Text style={styles.explanationText}>{sentiment.explanation}</Text>
            )}
            {sentiment.emotionalWeight && (
                <Text style={styles.weightText}>
                    Emotional weight: <Text style={styles.weightValue}>{sentiment.emotionalWeight}</Text>
                </Text>
            )}
        </View>
    );
}

function ConstructionSection({ construction }) {
    if (!construction) return null;

    return (
        <View style={styles.sectionContent}>
            <View style={styles.structureBadge}>
                <Text style={styles.structureLabel}>{construction.sentenceStructure}</Text>
            </View>
            {construction.explanation && (
                <Text style={styles.explanationText}>{construction.explanation}</Text>
            )}
            {construction.culturalNote && (
                <View style={styles.culturalNoteBox}>
                    <Ionicons name="bulb-outline" size={14} color="#F59E0B" />
                    <Text style={styles.culturalNoteText}>{construction.culturalNote}</Text>
                </View>
            )}
        </View>
    );
}

function AlternativesSection({ suggestions, onSelect }) {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <View style={styles.sectionContent}>
            {suggestions.map((alt, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.alternativeCard}
                    onPress={() => onSelect?.(alt.text)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.alternativeText}>"{alt.text}"</Text>
                    <View style={styles.altMeta}>
                        <View style={styles.altToneBadge}>
                            <Text style={styles.altToneText}>{alt.tone}</Text>
                        </View>
                    </View>
                    {alt.explanation && (
                        <Text style={styles.altExplanation}>{alt.explanation}</Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function BreakdownPanel({ visible, onClose, breakdown, isLoading, onSelectAlternative }) {
    const [openSections, setOpenSections] = useState({
        words: true,
        sentiment: false,
        construction: false,
        alternatives: false,
    });

    const toggleSection = (key) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FBBF24" />
                <Text style={styles.loadingText}>Analyzing translation...</Text>
            </View>
        );
    }

    if (!breakdown || !breakdown.success) {
        if (breakdown?.metadata?.error) {
            return (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                    <Text style={styles.errorText}>Analysis unavailable</Text>
                </View>
            );
        }
        return null;
    }

    return (
        <SwipeableBottomSheet visible={visible} onClose={onClose}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.headerBar}>
                    <Ionicons name="analytics-outline" size={18} color="#FBBF24" />
                <Text style={styles.headerTitle}>Translation Breakdown</Text>
            </View>

            {/* Word-by-Word */}
            <SectionHeader
                title="Word-by-Word Analysis"
                icon="text-outline"
                isOpen={openSections.words}
                onToggle={() => toggleSection('words')}
            />
            {openSections.words && <WordByWordSection words={breakdown.wordByWord} />}

            {/* Sentiment */}
            <SectionHeader
                title="Sentiment & Context"
                icon="heart-outline"
                isOpen={openSections.sentiment}
                onToggle={() => toggleSection('sentiment')}
            />
            {openSections.sentiment && <SentimentSection sentiment={breakdown.sentimentEvaluation} />}

            {/* Construction */}
            <SectionHeader
                title="Sentence Construction"
                icon="construct-outline"
                isOpen={openSections.construction}
                onToggle={() => toggleSection('construction')}
            />
            {openSections.construction && <ConstructionSection construction={breakdown.constructionAnalysis} />}

            {/* Alternatives */}
            <SectionHeader
                title="Alternative Suggestions"
                icon="bulb-outline"
                isOpen={openSections.alternatives}
                onToggle={() => toggleSection('alternatives')}
            />
            {openSections.alternatives && (
                <AlternativesSection
                    suggestions={breakdown.alternativeSuggestions}
                    onSelect={onSelectAlternative}
                />
            )}

            {/* Meta footer */}
            {breakdown.metadata && (
                <Text style={styles.metaFooter}>
                    Analyzed in {breakdown.metadata.analysisMs}ms • {breakdown.metadata.model}
                </Text>
            )}
            </ScrollView>
        </SwipeableBottomSheet>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFDF7',
        borderRadius: 20,
        marginHorizontal: 15,
        marginTop: 12,
        marginBottom: 30,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FEF3C7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
    },

    // Section headers
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#FEF3C7',
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    sectionContent: {
        paddingBottom: 8,
    },

    // Word-by-Word
    wordCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    wordPairRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    sourceWord: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
    },
    translatedWord: {
        fontSize: 15,
        fontWeight: '700',
        color: '#D97706',
    },
    posBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    posText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6366F1',
        textTransform: 'uppercase',
    },
    detailText: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
        marginTop: 2,
    },
    detailLabel: {
        fontWeight: '600',
        color: '#374151',
    },
    dialectNoteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
        backgroundColor: '#F5F3FF',
        padding: 6,
        borderRadius: 8,
    },
    dialectNoteText: {
        fontSize: 11,
        color: '#7C3AED',
        flex: 1,
    },

    // Sentiment
    sentimentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    toneBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    toneEmoji: {
        fontSize: 16,
    },
    toneLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#92400E',
    },
    confidenceBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    confidenceText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
    },
    explanationText: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
    },
    weightText: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
    },
    weightValue: {
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'capitalize',
    },

    // Construction
    structureBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    structureLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1D4ED8',
    },
    culturalNoteBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        backgroundColor: '#FFFBEB',
        padding: 10,
        borderRadius: 10,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    culturalNoteText: {
        fontSize: 12,
        color: '#92400E',
        flex: 1,
        lineHeight: 18,
    },

    // Alternatives
    alternativeCard: {
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    alternativeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#166534',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    altMeta: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 4,
    },
    altToneBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    altToneText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#15803D',
    },
    altExplanation: {
        fontSize: 11,
        color: '#6B7280',
        lineHeight: 16,
    },

    // Loading / Error
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 10,
    },
    loadingText: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 6,
    },
    errorText: {
        fontSize: 13,
        color: '#EF4444',
    },

    // Meta footer
    metaFooter: {
        fontSize: 10,
        color: '#D1D5DB',
        textAlign: 'center',
        marginTop: 8,
    },
});
