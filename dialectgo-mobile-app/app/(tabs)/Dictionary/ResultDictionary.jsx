import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import pronounceIcon from '@assets/icons/pronounceIcon.png';

function WordHeader({ word, phonetic, onPronounce }) {
  return (
    <Surface style={styles.wordCard} elevation={0}>
      <Text style={styles.mainWord}>{word}</Text>
      <Text style={styles.phonetic}>{phonetic || 'pronunciation N/A'}</Text>
      <TouchableOpacity style={styles.speakerBtn} onPress={onPronounce}>
        <Image source={pronounceIcon} style={styles.speakerIcon} />
      </TouchableOpacity>
    </Surface>
  );
}

function TranslationBox({ label, language, text }) {
  return (
    <View style={styles.defCol}>
      <Text style={styles.partOfSpeech}>{language}</Text>
      <Surface style={styles.defBox} elevation={0}>
        <Text style={styles.defLabel}>{label || 'Translation'}</Text>
        <Text style={styles.defText}>{text}</Text>
      </Surface>
    </View>
  );
}

function ExampleLine({ label, text }) {
  return (
    <View style={styles.exampleLine}>
      <Text style={styles.langLabel}>{label}: </Text>
      <Text style={styles.exampleText}>{text}</Text>
    </View>
  );
}

function ExampleSection({ examples }) {
  const hasValidExamples = examples && examples.length >= 3;

  return (
    <View style={styles.exampleSection}>
      <Text style={styles.exampleHeader}>Example Sentences:</Text>
      {hasValidExamples ? (
        <>
          <ExampleLine label="Cebuano" text={examples[2]} />
          <ExampleLine label="Tagalog" text={examples[1]} />
          <ExampleLine label="English" text={examples[0]} />
        </>
      ) : (
        <Text style={styles.exampleText}>No examples available for this word.</Text>
      )}
    </View>
  );
}

export default function ResultDictionary({ data }) {
  if (!data) return null;

  const { 
    english, 
    tagalog, 
    cebuano, 
    example_usage, 
    phonetic, 
    category,
    id 
  } = data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      <WordHeader 
        word={cebuano} 
        phonetic={phonetic} 
        onPronounce={() => console.log('Playing audio...')} 
      />

      <View style={styles.definitionRow}>
        <TranslationBox 
          language="Tagalog" 
          label={category} 
          text={tagalog} 
        />
        <TranslationBox 
          language="English" 
          label={category} 
          text={english} 
        />
      </View>

      <ExampleSection examples={example_usage} />

      <View style={styles.buttonRow}>
        
        <Button 
          mode="contained" 
          icon="star-outline"
          buttonColor="#FFCB45" 
          textColor="white"
          style={styles.actionBtn} 
          labelStyle={styles.btnLabel}
          onPress={() => console.log('Saved')}
        >
          Save
        </Button>

        <Button 
          mode="contained" 
          icon="history"
          buttonColor="#E5E7EB"
          textColor="black"
          style={styles.actionBtn} 
          labelStyle={styles.btnLabel}
          onPress={() => console.log('History')}
        >
          History
        </Button>
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, alignItems: 'center' },
  wordCard: {
    width: '100%',
    backgroundColor: '#FFCB45',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  mainWord: { fontSize: 48, fontWeight: '900', color: '#333' },
  phonetic: { fontSize: 18, fontStyle: 'italic', color: '#5D4037' },
  speakerBtn: { position: 'absolute', bottom: 15, right: 15 },
  speakerIcon: { width: 25, height: 25, resizeMode: 'contain' },
  definitionRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  defCol: { width: '48%', alignItems: 'center' },
  partOfSpeech: { fontSize: 16, fontStyle: 'italic', marginBottom: 10, color: '#5D4037' },
  defBox: {
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defLabel: { fontWeight: 'bold', fontSize: 14, marginBottom: 10, color: '#5D4037' },
  defText: { fontSize: 16, color: '#333', textAlign: 'center' },
  exampleSection: { width: '100%', marginBottom: 40 },
  exampleHeader: { fontWeight: 'bold', fontSize: 18, marginBottom: 10, color: '#333' },
  exampleLine: { flexDirection: 'row', marginBottom: 5, paddingLeft: 10 },
  langLabel: { fontWeight: 'bold', color: '#5D4037' },
  exampleText: { color: '#333', flexShrink: 1 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20, gap: 10,                    
},
  actionBtn: { flex: 1, borderRadius: 25, height: 50, justifyContent: 'center',},
  saveBtnLabel: { fontSize: 14, fontWeight: 'bold', },
  saveBtnLabel: { fontSize: 18, fontWeight: 'bold' },
});