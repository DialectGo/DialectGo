import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { supabase } from '../../shared/lib/supabase'; // Adjust path as needed

export default function ARTranslator({ targetLang }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText} onPress={requestPermission}>
          Grant Camera Access to use AR Translation
        </Text>
      </View>
    );
  }

  const takePictureAndTranslate = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      setTranslationResult(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          Alert.alert("Authentication Required", "Please log in.");
          return;
        }

        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.3,
          width: 800,
          doNotSave: true,
        });

        // Update the URL and include the required ID fields
        const response = await axios.post('http://192.168.0.104:5001/api/translate/image', {
          image: photo.base64,
          targetLang: targetLang,
          source_language_id: 1, // Ensure these map to your language list
          target_language_id: 3  // Example: 1=English, 3=Cebuano
        }, {
          headers: { 
            'Authorization': `Bearer ${session.access_token}` 
          }
        });

        setTranslationResult(response.data.translatedText);
      } catch (e) {
        console.error("Translation error:", e.response?.data || e.message);
        Alert.alert("Error", "Failed to translate image.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} />

      {/* Floating Result Card */}
      {translationResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultText}>{translationResult}</Text>
          <TouchableOpacity 
            style={styles.dismissButton} 
            onPress={() => setTranslationResult(null)}
          >
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.captureButton} 
        onPress={takePictureAndTranslate}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Translate</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#FBBF24',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
  },
  buttonText: { fontWeight: 'bold', color: '#fff', fontSize: 16 },
  resultCard: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  resultText: { fontSize: 18, color: '#333', textAlign: 'center', fontWeight: '500' },
  dismissText: { marginTop: 15, color: '#FBBF24', textAlign: 'center', fontWeight: 'bold' }
});