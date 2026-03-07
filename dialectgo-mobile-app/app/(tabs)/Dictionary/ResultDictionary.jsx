import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Pronounce icon
import pronounceIcon from '@assets/icons/pronounceIcon.png';

export default function ResultDictionary({ word }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Word Header Card */}
      <Surface style={styles.wordCard} elevation={0}>
        <Text style={styles.mainWord}>{word}</Text>
        <Text style={styles.phonetic}>un-sa</Text>
        <TouchableOpacity style={styles.speakerBtn}>
          <Image source={pronounceIcon} style={styles.speakerIcon} />
        </TouchableOpacity>
      </Surface>

      {/* Definitions Row */}
      <View style={styles.definitionRow}>
        <View style={styles.defCol}>
          <Text style={styles.partOfSpeech}>(pronoun)</Text>
          <Surface style={styles.defBox} elevation={0}>
            <Text style={styles.defLabel}>Definition</Text>
            <Text style={styles.defText}>what</Text>
          </Surface>
        </View>

        <View style={styles.defCol}>
          <Text style={styles.partOfSpeech}>(noun)</Text>
          <Surface style={styles.defBox} elevation={0}>
            <Text style={styles.defLabel}>Definition</Text>
            <Text style={styles.defText}>ounce</Text>
          </Surface>
        </View>
      </View>

      {/* Examples Section */}
      <View style={styles.exampleSection}>
        <Text style={styles.exampleHeader}>Example:</Text>
        
        <View style={styles.exampleLine}>
          <Text style={styles.langLabel}>Cebuano: </Text>
          <Text style={styles.exampleText}>Unsay ngalan mo?</Text>
        </View>

        <View style={styles.exampleLine}>
          <Text style={styles.langLabel}>Tagalog: </Text>
          <Text style={styles.exampleText}>Ano ang pangalan mo?</Text>
        </View>

        <View style={styles.exampleLine}>
          <Text style={styles.langLabel}>English: </Text>
          <Text style={styles.exampleText}>What is your name?</Text>
        </View>
      </View>

      {/* Save Button */}
      <Button 
        mode="contained" 
        icon="star-outline"
        buttonColor="#FFCB45" 
        textColor="white"
        style={styles.saveBtn}
        labelStyle={styles.saveBtnLabel}
        onPress={() => console.log('Saved')}
      >
        Save Word
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  wordCard: {
    width: '100%',
    backgroundColor: '#FFCB45',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  mainWord: {
    fontSize: 48,
    fontWeight: '900',
    color: '#333',
  },
  phonetic: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#5D4037',
  },
  speakerBtn: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  speakerIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  definitionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  defCol: {
    width: '46%',
    alignItems: 'center',
  },
  partOfSpeech: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 10,
    color: '#5D4037',
  },
  defBox: {
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
    color: '#5D4037',
  },
  defText: {
    fontSize: 16,
    color: '#333',
  },
  exampleSection: {
    width: '100%',
    marginBottom: 40,
  },
  exampleHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  exampleLine: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 10,
  },
  langLabel: {
    fontWeight: 'bold',
    color: '#5D4037',
  },
  exampleText: {
    color: '#333',
  },
  saveBtn: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 50,
    justifyContent: 'center',
  },
  saveBtnLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});