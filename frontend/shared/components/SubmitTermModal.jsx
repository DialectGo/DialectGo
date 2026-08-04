import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { WIKI_API_BASE } from '../config/apiConfig';

const REGIONS = ['Batangueño', 'Boholano', 'General Cebuano', 'General Tagalog'];
const CATEGORIES = ['Slang', 'Idiom', 'Colloquial', 'Literal'];
const SENTIMENTS = ['Casual', 'Humorous', 'Aggressive', 'Affectionate', 'Formal', 'Sarcastic'];

export default function SubmitTermModal({ visible, onClose, onSuccess }) {
  const [sourceTerm, setSourceTerm] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState('');
  const [translation, setTranslation] = useState('');
  const [usageExample, setUsageExample] = useState('');
  const [sentimentTag, setSentimentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSourceTerm('');
    setRegion('');
    setCategory('');
    setTranslation('');
    setUsageExample('');
    setSentimentTag('');
  };

  const handleSubmit = async () => {
    if (!sourceTerm.trim() || !region || !category || !translation.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Auth Required', 'Please log in to submit.');
        return;
      }

      const response = await fetch(WIKI_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          source_term: sourceTerm.trim(),
          region,
          category,
          translation: translation.trim(),
          usage_example: usageExample.trim() || null,
          sentiment_tag: sentimentTag || null,
        }),
      });

      const json = await response.json();

      if (json.success) {
        Alert.alert('Salamat! 🎉', 'Your contribution has been submitted for community review.');
        resetForm();
        onSuccess?.();
      } else {
        Alert.alert('Oops', json.message || 'Submission failed.');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Contribute a Term</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Source Term */}
            <Text style={styles.label}>
              Source Term / Phrase <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder='e.g., "Ala eh", "Buang"'
              placeholderTextColor="#9CA3AF"
              value={sourceTerm}
              onChangeText={setSourceTerm}
            />

            {/* Region */}
            <Text style={styles.label}>
              Region <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipRow}>
              {REGIONS.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, region === r && styles.activeChip]}
                  onPress={() => setRegion(r)}
                >
                  <Text style={[styles.chipText, region === r && styles.activeChipText]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category */}
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, category === c && styles.activeChip]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.chipText, category === c && styles.activeChipText]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Standard Translation */}
            <Text style={styles.label}>
              Standard Translation <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="What it means in English or standard language"
              placeholderTextColor="#9CA3AF"
              value={translation}
              onChangeText={setTranslation}
            />

            {/* Usage Example */}
            <Text style={styles.label}>Usage Example (Optional)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder='e.g., "Ala eh, ang ganda naman niyan!"'
              placeholderTextColor="#9CA3AF"
              value={usageExample}
              onChangeText={setUsageExample}
              multiline
              numberOfLines={3}
            />

            {/* Sentiment Tag */}
            <Text style={styles.label}>Tone / Sentiment (Optional)</Text>
            <View style={styles.chipRow}>
              {SENTIMENTS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, styles.sentimentOption, sentimentTag === s && styles.activeSentiment]}
                  onPress={() => setSentimentTag(sentimentTag === s ? '' : s)}
                >
                  <Text style={[styles.chipText, sentimentTag === s && styles.activeSentimentText]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#1F2937" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Contribution</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 30,
    maxHeight: '88%',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
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
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    fontWeight: '500',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  activeChip: {
    backgroundColor: '#FBBF24',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeChipText: {
    color: '#1F2937',
    fontWeight: '800',
  },
  sentimentOption: {
    backgroundColor: '#F5F3FF',
  },
  activeSentiment: {
    backgroundColor: '#7C3AED',
  },
  activeSentimentText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: '#FBBF24',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
});
