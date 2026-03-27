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
      <Surface style={styles.surface} elevation={2}>
        
        <TouchableOpacity 
          style={styles.langButton} 
          onPress={onSelectSource}
          activeOpacity={0.7}
        >
          <Text style={styles.langText} numberOfLines={1}>{sourceLang}</Text>
          <MaterialCommunityIcons name="menu-down" size={20} color="#374151" />
        </TouchableOpacity>

        <IconButton 
          icon={translateIcon}
          size={24}
          onPress={onSwap}
          iconColor="#1f2937"
          style={styles.swapIcon}
        />

        <TouchableOpacity 
          style={styles.langButton} 
          onPress={onSelectTarget}
          activeOpacity={0.7}
        >
          <Text style={styles.langText} numberOfLines={1}>{targetLang}</Text>
          <MaterialCommunityIcons name="menu-down" size={20} color="#374151" />
        </TouchableOpacity>
        
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDD30E', 
    borderRadius: 25, 
    paddingHorizontal: 10,
    height: 60, 
  },
  langButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    justifyContent: 'center',
    height: '100%',
  },
  langText: { 
    fontSize: 16, 
    color: '#1f2937', 
    fontWeight: '700', 
    marginRight: 2,
  },
  swapIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    marginHorizontal: 5,
  }
});