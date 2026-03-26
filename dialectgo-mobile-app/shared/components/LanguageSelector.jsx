import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Surface, Text, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LanguageSelector({ 
  sourceLang, 
  targetLang, 
  onSwap, 
  onSelectSource, 
  onSelectTarget,
  translateIcon 
}) {
  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={1}>
        <TouchableOpacity style={styles.langButton} onPress={onSelectSource}>
          <Text style={styles.langText}>{sourceLang}</Text>
          <MaterialCommunityIcons name="menu-down" size={24} color="#4b5563" />
        </TouchableOpacity>

        <IconButton 
          icon={translateIcon}
          size={24}
          onPress={onSwap}
        />

        <TouchableOpacity style={styles.langButton} onPress={onSelectTarget}>
          <Text style={styles.langText}>{targetLang}</Text>
          <MaterialCommunityIcons name="menu-down" size={24} color="#4b5563" />
        </TouchableOpacity>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 15 },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDD30E',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 65,
  },
  langButton: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  langText: { fontSize: 18, color: '#1f2937' },
});