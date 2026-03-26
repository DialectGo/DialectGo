import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Surface, Text, TextInput, IconButton, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function TranslationInput({ 
  value, 
  onChangeText, 
  onTranslate, 
  sourceLang, 
  isFocused, 
  onFocus, 
  onBlur, 
  onExit,
  icons // cameraIcon, micIcon
}) {
  const suggestions = ['Hi there', 'Good morning', 'How\'s it going'];
  const router = useRouter();

  return (
    <Surface style={[styles.card, { flex: isFocused ? 0.90 : 1 }]} elevation={0}>
      <View style={styles.header}>
        <Text variant="labelLarge" style={styles.label}>{sourceLang}</Text>
        {(isFocused || value.length > 0) && (
          <IconButton icon="close" size={20} onPress={onExit} style={styles.exitBtn} />
        )}
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" scrollEnabled={isFocused}>
        <TextInput
          placeholder="Enter your text"
          multiline
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          selectionColor="#FBBF24"
          style={[styles.textArea, { fontSize: isFocused ? 24 : 36 }]}
          placeholderTextColor="#B0ABAB"
        />
        
        {!isFocused && value.length === 0 && (
          <View style={styles.chipGroup}>
            {suggestions.map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.chip} onPress={() => onChangeText(item)}>
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <IconButton icon={icons.camera} size={28} onPress={() => router.push('/Translator/ImageToText')} />
        {value.length > 0 ? (
          <Button mode="contained" buttonColor="#FBBF24" onPress={onTranslate} style={styles.btn}>
            Translate
          </Button>
        ) : (
          <IconButton icon={icons.mic} size={32} onPress={() => router.push('/Translator/SpeechToText')} />
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF3D2', marginHorizontal: 15, borderRadius: 30, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { color: '#4b5563' },
  exitBtn: { backgroundColor: '#FDE68A', borderRadius: 12 },
  textArea: { backgroundColor: '#FFF3D2', fontWeight: '700'},
  chipGroup: { marginTop: 10 },
  chip: { backgroundColor: '#FDE68A', padding: 15, borderRadius: 25, marginBottom: 10, alignSelf: 'flex-start' },
  chipText: { color: '#1f2937' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btn: { borderRadius: 20 }
});