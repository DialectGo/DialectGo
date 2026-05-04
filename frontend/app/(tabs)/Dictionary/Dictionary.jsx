import React, { useState } from 'react';
import { FlatList, Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router'; 
import { StatusBar } from 'expo-status-bar';

import BottomNav from '../../../shared/components/BottomNav';
import TopBar from '../../../shared/components/TopBar';
import { styles } from '../../../shared/styles/DictionaryStyles';
import dictionaryData from '../../../data/dictionary/Dictionary.json';

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
            pronunciation: JSON.stringify(item.pronunciation || {}),
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
    <View style={{ flex: 1, backgroundColor: '#FFD54F' }}>
      <StatusBar style="dark" backgroundColor="#FFD54F" translucent={false} />
      
      <TopBar 
        onLogout={() => console.log("Logout")}
        onProfile={() => console.log("Profile")}
      />

      <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: '#FFFFFF' }]}>
        <View style={{ flex: 1 }}>
          
          {/* Header section na may aligned text at icons */}
          <View style={styles.header}>
            <View style={styles.titleWrapper}>
              <Text style={styles.headerTitleYellow}>DialectGo</Text>
              <Text style={styles.headerTitleBlack}>Dictionary</Text>
            </View>
            
            <View style={styles.headerIcons}>
              {/* Bookmark Star Icon */}
              <TouchableOpacity 
                style={styles.iconCircle} 
                onPress={() => router.push('/Dictionary/Bookmarks')}
              >
                <Image 
                  source={require('../../../assets/images/star.png')} 
                  style={styles.topIcon} 
                />
              </TouchableOpacity>

              {/* History Icon */}
              <TouchableOpacity 
                style={styles.iconCircle} 
                onPress={() => router.push('/Dictionary/History')}
              >
                <Image 
                  source={require('../../../assets/images/history.png')} 
                  style={styles.topIcon} 
                />
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

          {/* List of Words */}
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>

      <BottomNav activeTab="Dictionary" />
    </View>
  );
}