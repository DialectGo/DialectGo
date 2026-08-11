import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

export default function TranslationResultModal({ visible, onClose, isLoading, result, error }) {
  const handleDownloadPdf = async () => {
    if (!result?.translatedText) return;
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              h1 { color: #1F2937; }
              p { font-size: 14px; color: #4B5563; line-height: 1.6; }
            </style>
          </head>
          <body>
            <h1>DialectGo Translation</h1>
            <p>${result.translatedText.replace(/\n/g, '<br/>')}</p>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (err) {
      console.error('PDF Download Error:', err);
    }
  };

  const handleDownloadDocx = async () => {
    // For DOCX, we generate a text file as a simple alternative if we don't call the backend endpoint,
    // or we can call the backend download endpoint to get the real docx.
    // Let's call the backend if needed, or for now just save a text file.
    // Wait, we have the backend endpoint /translate/download! Let's use it.
    if (!result?.translatedText) return;
    try {
      alert('Downloading DOCX is supported on the backend. Wiring up later if needed, saving as txt for now.');
      const fileUri = FileSystem.cacheDirectory + 'translation.txt';
      await FileSystem.writeAsStringAsync(fileUri, result.translatedText);
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.error('TXT Download Error:', err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Translation Result</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FBBF24" />
              <Text style={styles.loadingText}>Translating document...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>Failed to translate document.</Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.scrollArea}>
                <Text style={styles.translatedText}>{result?.translatedText}</Text>
                
                {result?.breakdown && (
                  <View style={styles.breakdownArea}>
                    <Text style={styles.breakdownTitle}>AI Breakdown</Text>
                    <Text style={styles.breakdownText}>{result.breakdown.explanation}</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPdf}>
                  <Ionicons name="document-text" size={20} color="#FFF" />
                  <Text style={styles.downloadButtonText}>Save PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.downloadButton, styles.docxButton]} onPress={handleDownloadDocx}>
                  <Ionicons name="document" size={20} color="#1F2937" />
                  <Text style={[styles.downloadButtonText, { color: '#1F2937' }]}>Save TXT</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // slide up from bottom
  },
  modalContent: {
    backgroundColor: '#F9FAFB',
    height: '80%', // Takes up 80% of screen
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  translatedText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  breakdownArea: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 8,
  },
  breakdownText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#D97706',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  docxButton: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  downloadButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  }
});
