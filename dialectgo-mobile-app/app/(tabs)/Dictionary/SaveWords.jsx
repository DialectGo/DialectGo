import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Text, Surface, Checkbox } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DUMMY_SAVED = [
  { id: '1', main: 'Ugma', sub: 'Tomorrow/Bukas', lang: 'Cebuano', date: '2026-03-28 23:30' },
  { id: '2', main: 'Eat/Kain', sub: 'Kaon', lang: 'English/Tagalog', date: '2026-03-01 15:28' },
];

export default function SaveWords() {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState(DUMMY_SAVED);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const renderItem = ({ item }) => (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.cardLang}>{item.lang}</Text>
          <Text style={styles.cardMain}>{item.main}</Text>
          <Text style={styles.cardSub}>{item.sub}</Text>
        </View>
        <View style={styles.cardRight}>
          <Checkbox
            status={selectedIds.includes(item.id) ? 'checked' : 'unchecked'}
            onPress={() => toggleSelect(item.id)}
            color="#FFCB45"
          />
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
      </View>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Save Word</Text>
        <View style={{ width: 30 }} /> 
      </View>

      <FlatList
        data={savedItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
        
        <View style={styles.selectAllContainer}>
          <Text style={styles.allText}>All</Text>
          <Checkbox
            status={selectedIds.length === savedItems.length ? 'checked' : 'unchecked'}
            onPress={() => {
              if (selectedIds.length === savedItems.length) setSelectedIds([]);
              else setSelectedIds(savedItems.map(i => i.id));
            }}
            color="#FFCB45"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  listContent: { padding: 15 },
  card: {
    backgroundColor: '#FFF9E7',
    borderRadius: 20,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLang: { color: '#6B7280', fontSize: 12, textAlign: 'right', position: 'absolute', right: 0, top: -5 },
  cardMain: { fontSize: 18, textDecorationLine: 'underline', color: '#374151' },
  cardSub: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  cardRight: { justifyContent: 'space-between', alignItems: 'flex-end' },
  cardDate: { fontSize: 10, color: '#9CA3AF', marginTop: 5 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  deleteBtn: {
    backgroundColor: '#FFCB45',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  deleteBtnText: { fontWeight: 'bold', fontSize: 16 },
  selectAllContainer: { flexDirection: 'row', alignItems: 'center' },
  allText: { fontSize: 16, color: '#6B7280', marginRight: 5 }
});