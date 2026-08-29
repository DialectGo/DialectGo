import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDateDisplay } from '../../utils/dateUtils';

export default function ViewSuggestionModal({ visible, onClose, suggestion }) {
  if (!suggestion) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Translation Suggestion</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>SOURCE TEXT</Text>
            <Text style={styles.textValue}>{suggestion.source_text}</Text>

            <Text style={[styles.label, { marginTop: 16 }]}>YOUR TRANSLATION</Text>
            <Text style={styles.textValue}>{suggestion.user_translation}</Text>

            <View style={styles.footerRow}>
              <View>
                <Text style={styles.label}>STATUS</Text>
                <View style={[
                  styles.statusBadge,
                  suggestion.status === 'approved' ? styles.statusApproved : styles.statusPending
                ]}>
                  <Text style={[
                    styles.statusText,
                    suggestion.status === 'approved' ? styles.statusTextApproved : styles.statusTextPending
                  ]}>
                    {suggestion.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View>
                <Text style={styles.label}>SUBMITTED ON</Text>
                <Text style={styles.dateText}>{formatDateDisplay(suggestion.created_at)}</Text>
              </View>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 24,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusApproved: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextApproved: {
    color: '#059669',
  },
  statusTextPending: {
    color: '#D97706',
  },
  dateText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  }
});
