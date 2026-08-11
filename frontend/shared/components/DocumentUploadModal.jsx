import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function DocumentUploadModal({ visible, onClose, onFileSelected }) {
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        onClose();
        setTimeout(() => {
          onFileSelected(result.assets[0]);
        }, 500);
      }
    } catch (err) {
      console.error('Document picking error:', err);
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("You've refused to allow this app to access your photos!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        onClose();
        setTimeout(() => {
          onFileSelected(result.assets[0]);
        }, 500);
      }
    } catch (err) {
      console.error('Image picking error:', err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Upload File</Text>
          <Text style={styles.subtitle}>Select the type of file you want to translate</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={handlePickDocument}>
              <Ionicons name="document-text-outline" size={32} color="#1F2937" />
              <Text style={styles.optionText}>Document</Text>
              <Text style={styles.optionSubtext}>PDF, DOCX</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={32} color="#1F2937" />
              <Text style={styles.optionText}>Image</Text>
              <Text style={styles.optionSubtext}>JPG, PNG</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
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
  },
  modalContent: {
    backgroundColor: 'white',
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '45%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  optionSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
  }
});
