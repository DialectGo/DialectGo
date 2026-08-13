import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import SwipeableBottomSheet from './SwipeableBottomSheet';

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
        mediaTypes: ['images'],
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
    <SwipeableBottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheetContent}>
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
      </View>
    </SwipeableBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
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
    justifyContent: 'space-between',
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  optionSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
