import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Surface, Text } from 'react-native-paper';

export default function ResultCard({ translatedText, targetLang, pronounceIcon }) {
  return (
    <Surface style={styles.card} elevation={0}>
      <View style={styles.header}>
        <Text style={styles.label}>{targetLang}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.translatedText}>{translatedText}</Text>
      </View>
      
      <View style={styles.footer}>
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
  footer: { alignItems: 'flex-end', marginTop: 10, marginRight: 10},
  icon: { width: 20, height: 20, tintColor: '#000' }
});