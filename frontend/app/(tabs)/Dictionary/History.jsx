import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const router = useRouter();

  // Load history pagbukas ng screen
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('history_list');
      if (data) {
        setHistoryItems(JSON.parse(data));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('history_list');
      setHistoryItems([]);
    } catch (e) {
      console.error("Failed to clear history", e);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={styles.historyCard} 
      onPress={() => {
        // I-navigate pabalik sa ResultDictionary gamit ang data mula sa history
        router.push({
          pathname: '/Dictionary/ResultDictionary',
          params: {
            cebuano: item.cebuano,
            tagalog: item.tagalog,
            english: item.english,
            pos: item.part_of_speech || 'Word',
            examples: item.examples ? JSON.stringify(item.examples) : JSON.stringify([])
          }
        });
      }} 
    >
      <View>
        <Text style={styles.wordText}>{item.cebuano}</Text>
        <Text style={styles.typeText}>{item.part_of_speech || 'WORD'}</Text>
      </View>
      <Image 
        source={require('../../../assets/icons/back_arrow.png')} 
        style={styles.arrowIcon} 
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backBtn}
        >
           <Image source={require('../../../assets/icons/back_arrow.png')} style={styles.backImg} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Recent History</Text>
        
        <TouchableOpacity onPress={clearHistory}>
          <Text style={styles.clearBtn}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* LIST SECTION */}
      {historyItems.length > 0 ? (
        <FlatList
          data={historyItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No recent searches yet.</Text>
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
    alignItems: 'center', 
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: { 
    fontSize: 22, 
    fontFamily: 'Poppins-Bold', 
    color: '#421C00' 
  },
  clearBtn: { 
    color: '#FF5252', 
    fontFamily: 'Poppins-Medium',
    fontSize: 14 
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 25,
    marginBottom: 12,
    padding: 20,
    borderRadius: 20, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#421C00',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  wordText: { 
    fontSize: 18, 
    fontFamily: 'Poppins-Bold', 
    color: '#421C00' 
  },
  typeText: { 
    fontSize: 12, 
    color: '#8E8E8E', 
    textTransform: 'uppercase', 
    fontFamily: 'Poppins-Medium' 
  },
  arrowIcon: { 
    width: 16, 
    height: 16, 
    transform: [{ rotate: '180deg' }], 
    tintColor: '#FFD54F' 
  },
  listPadding: { 
    paddingBottom: 30, 
    paddingTop: 10 
  },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyText: { 
    color: '#ADB5BD', 
    fontFamily: 'Poppins-Medium' 
  },
  backBtn: { 
    padding: 5 
  },
  backImg: { 
    width: 22, 
    height: 22,
    tintColor: '#421C00'
  }
});