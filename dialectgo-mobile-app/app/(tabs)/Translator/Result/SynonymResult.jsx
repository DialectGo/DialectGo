import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip } from 'react-native-paper';

export default function SynonymResult({ translatedText }) {
  const synonyms = ['Halo', 'Kumusta', 'Maayong adlaw'];
  return (
    <View>
      <Text style={styles.title}>SYNONYMS</Text>
      <View style={styles.chipRow}>
        {synonyms.map((s, i) => (
          <Chip key={i} style={styles.chip} textStyle={{color: '#48AAD9'}}>{s}</Chip>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: 12, fontWeight: '800', color: '#6b7280', marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { marginRight: 8, marginBottom: 8, backgroundColor: '#FFFFFF' }
});