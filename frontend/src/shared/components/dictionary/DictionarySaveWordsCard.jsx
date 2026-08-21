import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function DictionarySaveWordsCard({
  item,
  index,
  selectedIds,
  toggleSelect,
  router,
  styles
}) {
  const entry = item.entry || {};
  const translations = entry.translations || [];
  const isSelected = selectedIds.has(item.id);
  
  const trans1 = translations[0]?.target_entry?.word_term || '';
  const trans2 = translations[1]?.target_entry?.word_term || '';
  const usage1 = translations[0]?.target_entry?.example_usage || '';
  const usage2 = translations[1]?.target_entry?.example_usage || '';
  const translationDisplay = [trans1, trans2].filter(Boolean).join(' / ') || 'No translation';

  return (
    <View key={item.id?.toString() || index.toString()} style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.checkboxContainer} 
        onPress={() => toggleSelect(item.id)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
          {isSelected && <View style={styles.checkboxInner} />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        activeOpacity={0.7}
        style={styles.card} 
        onPress={() => {
          router.push({
            pathname: '/Dictionary/ResultDictionary',
            params: {
              id: entry.id,
              wordTerm: entry.word_term,
              definition: entry.definition,
              partOfSpeech: entry.part_of_speech,
              phoneticTranscription: entry.phonetic_transcription,
              exampleUsage: entry.example_usage,
              translation1: trans1,
              translation2: trans2,
              usage1: usage1,
              usage2: usage2 
            }
          });
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.wordText}>{entry.word_term}</Text>
          <Text style={styles.translationText}>{translationDisplay}</Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.posTag}>{entry.part_of_speech?.toUpperCase() || 'WORD'}</Text>
          <Image source={require('../../../../assets/icons/status/star.png')} style={styles.starIcon} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
