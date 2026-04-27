import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useRouter } from 'expo-router';

export default function SaveWords() {
  const [bookmarks, setBookmarks] = useState([]);
  const router = useRouter();

  // Load bookmarks tuwing papasok sa screen
  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const data = await AsyncStorage.getItem('bookmarks_list');
      if (data) {
        setBookmarks(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={styles.card} 
      onPress={() => {
        router.push({
          pathname: '/Dictionary/ResultDictionary',
          params: {
            cebuano: item.cebuano,
            english: item.english,
            tagalog: item.tagalog,
            pos: item.pos || item.part_of_speech || 'Word',
            examples: item.examples ? JSON.stringify(item.examples) : JSON.stringify([])
          }
        });
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.wordText}>{item.cebuano}</Text>
        <Text style={styles.translationText}>{item.english} / {item.tagalog}</Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.posTag}>{item.pos || item.part_of_speech || 'WORD'}</Text>
        <Image 
          source={require('../../../assets/icons/star.png')} 
          style={styles.starIcon} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Image 
            source={require('../../../assets/icons/back_arrow.png')} 
            style={styles.backImg} 
          />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Words</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* LIST SECTION */}
      {bookmarks.length > 0 ? (
        <FlatList
          data={bookmarks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('../../../assets/icons/star.png')} 
            style={styles.emptyIcon} 
          />
          <Text style={styles.emptyText}>No saved words yet.</Text>
          <Text style={styles.emptySubText}>
            Tap the star icon on any word in the dictionary to save it here.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFDF5' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center' 
  },
  backButton: {
    padding: 8,
  },
  backImg: { 
    width: 24, 
    height: 24,
    tintColor: '#421C00'
  },
  title: { 
    fontSize: 22, 
    fontFamily: 'Poppins-Bold', 
    color: '#421C00' 
  },
  listContainer: { 
    paddingHorizontal: 25, 
    paddingTop: 10,
    paddingBottom: 40 
  },
  card: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  wordText: { 
    fontSize: 18, 
    fontFamily: 'Poppins-Bold', 
    color: '#421C00' 
  },
  translationText: { 
    fontSize: 13, 
    fontFamily: 'Poppins-Regular',
    color: '#8E8E8E', 
    marginTop: 2 
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  posTag: {
    fontSize: 9,
    color: '#FFB800',
    fontFamily: 'Poppins-Bold',
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  starIcon: { 
    width: 18, 
    height: 18, 
    tintColor: '#FFD54F' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },
  emptyIcon: {
    width: 60,
    height: 60,
    tintColor: '#E0E0E0',
    marginBottom: 15
  },
  emptyText: { 
    fontSize: 18, 
    fontFamily: 'Poppins-Bold', 
    color: '#421C00' 
  },
  emptySubText: {
    textAlign: 'center',
    color: '#ADB5BD',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
    lineHeight: 20
  }
});