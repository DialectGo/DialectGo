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
  
  const translationDisplay = translations.map(t => t?.target_entry?.word_term).filter(Boolean).join(' / ') || 'No translation';

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
              translationsStr: JSON.stringify(translations)
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
          <Image source={require('../../../../assets/icons/nav/save_word_icon.png')} style={styles.starIcon} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
