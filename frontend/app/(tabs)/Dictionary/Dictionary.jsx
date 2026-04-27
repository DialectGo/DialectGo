import React, { useState } from 'react';
import { FlatList, Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router'; 

import BottomNav from '../../../shared/components/BottomNav';
import TopBar from '../../../shared/components/TopBar';
import { styles } from '../../../shared/styles/DictionaryStyles';
import dictionaryData from '../../../data/dictionary/cebuano_dictionary.json';

export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter(); 

  const filteredData = (dictionaryData || []).filter(item => {
    const search = searchQuery.toLowerCase();
    return (
      (item.cebuano || "").toLowerCase().includes(search) || 
      (item.english || "").toLowerCase().includes(search) || 
      (item.tagalog || "").toLowerCase().includes(search)
    );
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      style={styles.entryCard} 
      onPress={() => {
        router.push({
          pathname: '/Dictionary/ResultDictionary', 
          params: { 
            cebuano: item.cebuano,
            english: item.english,
            tagalog: item.tagalog,
            pos: item.part_of_speech || 'Word',
            examples: JSON.stringify(item.examples || []) 
          }
        });
      }} 
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.entryWord}>{item.cebuano}</Text>
        <Text style={styles.entryTranslation}>{item.english} / {item.tagalog}</Text>
      </View>

      {item.part_of_speech && (
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{item.part_of_speech.toUpperCase()}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopBar onMenuPress={() => console.log("Menu Pressed!")} />

      <View style={{ flex: 1 }}>
        {/* Header section na hindi dikit sa taas */}
        <View style={[styles.header, { marginTop: 10 }]}>
          <View>
            <Text style={styles.headerTitleYellow}>DialectGo</Text>
            <Text style={styles.headerTitleBlack}>Dictionary</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconCircle}>
              <Image source={require('../../../assets/images/history.png')} style={styles.topIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search words..."
            placeholderTextColor="#421C00"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Image source={require('../../../assets/images/search.png')} style={styles.searchIcon} />
        </View>

        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <BottomNav activeTab="Dictionary" />
    </SafeAreaView>
  );
}