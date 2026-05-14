// shared/components/DictionaryFilters.jsx
import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LANGUAGES = [
  { label: 'All', id: null },
  { label: 'English', id: 1 },
  { label: 'Tagalog', id: 2 },
  { label: 'Cebuano', id: 3 }
];

export default function DictionaryFilters({ selectedLang, setSelectedLang, selectedLetter, setSelectedLetter }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 15, marginBottom: 10 }}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity 
            key={lang.label}
            onPress={() => setSelectedLang(lang.id)}
            style={[styles.filterTab, selectedLang === lang.id && styles.activeFilterTab]}
          >
            <Text style={[styles.filterTabText, selectedLang === lang.id && styles.activeFilterTabText]}>{lang.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 15 }}>
        <TouchableOpacity 
           onPress={() => setSelectedLetter(null)}
           style={[styles.letterBtn, !selectedLetter && styles.activeLetterBtn]}
        >
          <Text style={{ color: !selectedLetter ? '#FFF' : '#000' }}>#</Text>
        </TouchableOpacity>
        {LETTERS.map(l => (
          <TouchableOpacity 
            key={l} 
            onPress={() => setSelectedLetter(l)}
            style={[styles.letterBtn, selectedLetter === l && styles.activeLetterBtn]}
          >
            <Text style={{ color: selectedLetter === l ? '#FFF' : '#000' }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create({
  // ... your existing styles ...

  // Container for the horizontal scrollers
  filterContainer: {
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },

  // Language Pill Styles
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5', // Light grey for unselected
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilterTab: {
    backgroundColor: '#FFD54F', // Match the yellow in the screenshot
    borderColor: '#FFC107',
  },
  filterTabText: {
    fontSize: 14,
    color: '#616161',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#421C00', // Darker text for contrast on yellow
    fontWeight: 'bold',
  },

  // A-Z Letter Styles
  letterBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    marginBottom: 5, // Prevents clipping if container is tight
  },
  activeLetterBtn: {
    backgroundColor: '#421C00', // Dark brown to match "Dictionary" title
  },
  letterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#421C00',
  },
  activeLetterText: {
    color: '#FFFFFF',
  },
});