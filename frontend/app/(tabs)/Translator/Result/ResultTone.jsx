import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function ResultTone() {
  return (
    <View>
      <Text style={styles.title}>TONE & CONTEXT</Text>
      <Text style={styles.desc}>
        This translation is <Text style={{fontWeight: 'bold'}}>Informal</Text>. 
        It is best used among friends or family members in casual settings.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: 12, fontWeight: '800', color: '#6b7280', marginBottom: 10 },
  desc: { fontSize: 14, color: '#374151', lineHeight: 20 }
});