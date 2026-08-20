import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../features/translator/styles/TranslateStyles';
import { DIALECT_OPTIONS } from '../../hooks/translate/constants';

export default function InputCard({
  sourceLang,
  targetLang,
  inputText,
  setInputText,
  setBreakdownData,
  setDocUploadVisible,
  setSpeechModalVisible,
  targetDialect,
  setTargetDialect,
}) {
  return (
    <View style={styles.translateCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.inputLabel}>{sourceLang.toUpperCase()}</Text>
        <TouchableOpacity onPress={() => { setInputText(''); setBreakdownData(null); }}>
          <Ionicons name="close-circle" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.mainInput}
        placeholder="Type something to translate..."
        placeholderTextColor="#9CA3AF"
        multiline
        value={inputText}
        onChangeText={setInputText}
      />
      <View style={styles.cardFooter}>
        <View style={[styles.shortcutIcons, { alignItems: 'center', gap: 8 }]}>
          <TouchableOpacity onPress={() => setDocUploadVisible(true)} style={styles.iconBtn}>
            <Ionicons name="document-text" size={22} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSpeechModalVisible(true)} style={styles.iconBtn}>
            <Ionicons name="mic" size={22} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {DIALECT_OPTIONS[targetLang] && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {DIALECT_OPTIONS[targetLang].map((option) => (
              <TouchableOpacity
                key={option.label}
                onPress={() => setTargetDialect(option.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 16,
                  backgroundColor: targetDialect === option.value ? '#FBBF24' : '#F3F4F6',
                  borderWidth: 1,
                  borderColor: targetDialect === option.value ? '#F59E0B' : '#E5E7EB',
                }}
              >
                <Text style={{
                  fontSize: 11,
                  fontWeight: targetDialect === option.value ? '700' : '500',
                  color: targetDialect === option.value ? '#1F2937' : '#6B7280',
                }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
