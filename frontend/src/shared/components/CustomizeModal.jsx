/**
 * CustomizeModal — Bottom-sheet modal for tone/audience customization.
 * 
 * Allows users to regenerate a translation with specific:
 * - Tone (Formal, Casual, Flirty, Respectful, Playful)
 * - Audience (Elder, Peer, Child, Stranger, Partner)
 * - Free-text context input
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Modal,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TONE_OPTIONS = [
    { label: 'Formal', value: 'formal', icon: 'ribbon-outline' },
    { label: 'Casual', value: 'casual', icon: 'chatbubble-outline' },
    { label: 'Flirty', value: 'flirty', icon: 'heart-outline' },
    { label: 'Respectful', value: 'respectful', icon: 'hand-left-outline' },
    { label: 'Playful', value: 'playful', icon: 'happy-outline' },
];

const AUDIENCE_OPTIONS = [
    { label: 'Elder', value: 'elder', icon: 'people-outline' },
    { label: 'Peer', value: 'peer', icon: 'person-outline' },
    { label: 'Child', value: 'child', icon: 'balloon-outline' },
    { label: 'Stranger', value: 'stranger', icon: 'help-circle-outline' },
    { label: 'Partner', value: 'partner', icon: 'heart-half-outline' },
];

function PillSelector({ title, options, selected, onSelect }) {
    return (
        <View style={styles.pillSection}>
            <Text style={styles.pillSectionTitle}>{title}</Text>
            <View style={styles.pillRow}>
                {options.map((opt) => {
                    const isActive = selected === opt.value;
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => onSelect(isActive ? null : opt.value)}
                            style={[styles.pill, isActive && styles.pillActive]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={opt.icon}
                                size={14}
                                color={isActive ? '#1F2937' : '#9CA3AF'}
                            />
                            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default function CustomizeModal({ visible, onClose, onSubmit, isLoading }) {
    const [tone, setTone] = useState(null);
    const [audience, setAudience] = useState(null);
    const [context, setContext] = useState('');

    const handleSubmit = () => {
        onSubmit({ tone, audience, context: context.trim() || null, style: null });
    };

    const handleClose = () => {
        setTone(null);
        setAudience(null);
        setContext('');
        onClose();
    };

    const hasSelection = tone || audience || context.trim();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />

                <View style={styles.sheet}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.sheetHeader}>
                        <View style={styles.sheetHeaderLeft}>
                            <Ionicons name="color-wand-outline" size={20} color="#FBBF24" />
                            <Text style={styles.sheetTitle}>Customize Translation</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={22} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Tone */}
                        <PillSelector
                            title="Tone"
                            options={TONE_OPTIONS}
                            selected={tone}
                            onSelect={setTone}
                        />

                        {/* Audience */}
                        <PillSelector
                            title="Who are you talking to?"
                            options={AUDIENCE_OPTIONS}
                            selected={audience}
                            onSelect={setAudience}
                        />

                        {/* Free-text context */}
                        <View style={styles.contextSection}>
                            <Text style={styles.pillSectionTitle}>Additional Context (optional)</Text>
                            <TextInput
                                style={styles.contextInput}
                                placeholder="e.g., I'm apologizing to my grandmother..."
                                placeholderTextColor="#D1D5DB"
                                value={context}
                                onChangeText={setContext}
                                multiline
                                maxLength={200}
                            />
                            <Text style={styles.charCount}>{context.length}/200</Text>
                        </View>
                    </ScrollView>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, !hasSelection && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={!hasSelection || isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#1F2937" />
                        ) : (
                            <>
                                <Ionicons name="refresh-outline" size={18} color="#1F2937" />
                                <Text style={styles.submitText}>Regenerate Translation</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '75%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sheetHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sheetTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1F2937',
    },

    // Pill selector
    pillSection: {
        marginBottom: 20,
    },
    pillSectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 10,
    },
    pillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        gap: 6,
    },
    pillActive: {
        backgroundColor: '#FBBF24',
        borderColor: '#F59E0B',
    },
    pillText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6B7280',
    },
    pillTextActive: {
        fontWeight: '700',
        color: '#1F2937',
    },

    // Context input
    contextSection: {
        marginBottom: 20,
    },
    contextInput: {
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 14,
        fontSize: 14,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        minHeight: 60,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 10,
        color: '#D1D5DB',
        textAlign: 'right',
        marginTop: 4,
    },

    // Submit
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FBBF24',
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
        marginTop: 8,
    },
    submitBtnDisabled: {
        opacity: 0.4,
    },
    submitText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
    },
});
