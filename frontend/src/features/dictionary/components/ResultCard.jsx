import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function ResultCard({ translatedText, targetLang, pronounceIcon, onShowBreakdown, onCustomize, isBreakdownLoading }) {
  return (
    <Surface style={styles.card} elevation={0}>
      <View style={styles.header}>
        <Text style={styles.label}>{targetLang}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.translatedText}>{translatedText}</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.actionRow}>
          {/* Breakdown button */}
          {onShowBreakdown && (
            <TouchableOpacity
              style={styles.breakdownBtn}
              onPress={onShowBreakdown}
              disabled={isBreakdownLoading}
              activeOpacity={0.7}
            >
              <Ionicons
                name="analytics-outline"
                size={16}
                color="#D97706"
              />
              <Text style={styles.breakdownBtnText}>
                {isBreakdownLoading ? 'Analyzing...' : 'Breakdown'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Customize button */}
          {onCustomize && (
            <TouchableOpacity
              style={styles.customizeBtn}
              onPress={onCustomize}
              activeOpacity={0.7}
            >
              <Ionicons name="color-wand-outline" size={16} color="#7C3AED" />
              <Text style={styles.customizeBtnText}>Customize</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.pronounceBtn}>
           <Image source={pronounceIcon} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#FFF3D2', 
    marginHorizontal: 15, 
    borderRadius: 30, 
    padding: 20, 
    minHeight: 250,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 3 
  },
  header: { marginBottom: 15 },
  label: { color: '#4b5563', fontSize: 16 },
  content: { flex: 1, justifyContent: 'center' },
  translatedText: { 
    fontSize: 40, 
    fontWeight: '700', 
    color: '#000000',
    textAlign: 'left' 
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  breakdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  breakdownBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  customizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  customizeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  pronounceBtn: {},
  icon: { width: 20, height: 20, tintColor: '#000' },
});