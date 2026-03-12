import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';

export default function ResultExample({ sourceText, translatedText }) {
  const examples = [
    { src: `I just wanted to say ${sourceText} to everyone!`, res: `Gusto lang nako isulti ang ${translatedText} sa tanan!` },
    { src: `Can you help me with ${sourceText}?`, res: `Pwede ba ko nimo tabangan sa ${translatedText}?` }
  ];

  return (
    <View>
      <Text style={styles.title}>EXAMPLES</Text>
      {examples.map((item, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.src}>{item.src}</Text>
          <Text style={styles.res}>{item.res}</Text>
          {index < examples.length - 1 && <Divider style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 12, fontWeight: '800', color: '#6b7280', marginBottom: 10 },
  item: { paddingVertical: 10 },
  src: { fontSize: 14, color: '#1f2937' },
  res: { fontSize: 14, color: '#48AAD9', fontWeight: '600', marginTop: 4 },
  divider: { marginVertical: 8 }
});