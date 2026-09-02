import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TermsAndAgreementModal({ visible, onClose, onAccept, isAccepted }) {
  const [localAccepted, setLocalAccepted] = useState(isAccepted);

  useEffect(() => {
    setLocalAccepted(isAccepted);
  }, [isAccepted, visible]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <FontAwesome5 name="chevron-left" size={18} color="#421C00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms & Agreement</Text>
        </View>

        {/* Terms Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Terms</Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.paragraph}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </Text>
            
            <Text style={styles.subHeading}>1. Use of Service</Text>
            <Text style={styles.paragraph}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
            </Text>
            
            <Text style={styles.subHeading}>2. User Responsibilities</Text>
            <Text style={styles.paragraph}>
              Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.
            </Text>
            
            <Text style={styles.subHeading}>3. Privacy Policy</Text>
            <Text style={styles.paragraph}>
              Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.
            </Text>
            
            <Text style={styles.subHeading}>4. Limitations</Text>
            <Text style={styles.paragraph}>
              Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
            </Text>
            
            <Text style={styles.subHeading}>5. Changes to Terms</Text>
          </ScrollView>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.checkboxRow}>
            <Text style={styles.checkboxText}>I agree with the Terms and Agreement</Text>
            <TouchableOpacity 
              style={[styles.checkbox, localAccepted && styles.checkboxChecked]}
              onPress={() => setLocalAccepted(!localAccepted)}
            >
              {localAccepted && <FontAwesome5 name="check" size={14} color="#421C00" />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.acceptBtn, !localAccepted && { opacity: 0.5 }]} 
            disabled={!localAccepted}
            onPress={() => {
              onAccept();
              onClose();
            }}
          >
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: {
    backgroundColor: '#FFD54D',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#FFC107',
  },
  card: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: '#FFFDE7', // very light yellow
    borderWidth: 2,
    borderColor: '#FFD54D',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#421C00',
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  subHeading: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#000',
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#555',
    lineHeight: 20,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  checkboxText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#000',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FFC107',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    backgroundColor: '#FFC107',
  },
  acceptBtn: {
    backgroundColor: '#FFC107',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  acceptBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#000',
  },
});
