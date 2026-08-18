// components/shared/FeatureGateModal.jsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function FeatureGateModal({ visible, onClose }) {
  const router = useRouter();

  const handleAuthenticationRedirect = () => {
    onClose();
    // Redirect back to landing auth index layout
    router.replace('/auth/AuthTransition'); 
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.lockIconContainer}>
            {/* Visual locked icon accent indicator */}
            <Text style={{ fontSize: 40 }}>🔒</Text>
          </View>
          
          <Text style={styles.modalTitle}>Authentication Required</Text>
          <Text style={styles.modalDescription}>
            Building streak multipliers and logging custom trilingual histories requires a personalized profile space. Join DialectGo today!
          </Text>

          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Browse More</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.authButton} onPress={handleAuthenticationRedirect}>
              <Text style={styles.authButtonText}>Sign Up / Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  lockIconContainer: {
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center'
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  actionContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between'
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600'
  },
  authButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#FFD700', // Accent tone match matching bee branding theme
    alignItems: 'center'
  },
  authButtonText: {
    color: '#000',
    fontWeight: '700'
  }
});