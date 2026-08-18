import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * A reusable Modal Overlay for displaying Word of the Day details.
 * Can be used on the Home screen or within the Dictionary/Games features.
 * 
 * @param {boolean} visible - Controls the visibility of the modal
 * @param {function} onClose - Callback function when the close button is pressed
 * @param {object} wordData - The word object containing term, definition, and usages
 */
export default function WordOfDayOverlay({ visible, onClose, wordData }) {
  if (!wordData) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.wotdModalCard}>
          <Text style={styles.wotdModalTitle}>“{wordData.term}”</Text>
          <View style={styles.wotdDivider} />
          
          <Text style={styles.wotdModalSubtitle}>Definition</Text>
          <Text style={styles.wotdModalText}>{wordData.definition}</Text>

          <Text style={[styles.wotdModalSubtitle, { marginTop: 15 }]}>Usages</Text>
          {wordData.usageCeb ? <Text style={styles.wotdModalUsage}>• Ceb: "{wordData.usageCeb}"</Text> : null}
          {wordData.usageEng ? <Text style={styles.wotdModalUsage}>• Eng: "{wordData.usageEng}"</Text> : null}
          {wordData.usageTag ? <Text style={styles.wotdModalUsage}>• Tag: "{wordData.usageTag}"</Text> : null}

          <TouchableOpacity
            style={styles.wotdModalCloseBtn}
            onPress={onClose}
          >
            <Text style={styles.wotdModalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  wotdModalCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  wotdModalTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#421C00',
    textAlign: 'center',
    marginBottom: 10,
  },
  wotdDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginBottom: 15,
  },
  wotdModalSubtitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#B45309',
    marginBottom: 5,
  },
  wotdModalText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  wotdModalUsage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  wotdModalCloseBtn: {
    backgroundColor: '#FFD54F',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 25,
  },
  wotdModalCloseText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#421C00',
  },
});
