import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useCallback } from 'react';
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import BottomNav from '../../../shared/components/BottomNav';
import { styles } from '../../../shared/styles/SavedWordsStyles';

export default function SaveWords() {
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
    }, [])
  );

  const fetchBookmarks = async () => {
    try {
      const data = await AsyncStorage.getItem('bookmarks_list');
      if (data) setBookmarks(JSON.parse(data));
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  const toggleSelect = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === bookmarks.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(bookmarks.map((_, index) => index));
    }
  };

  const handleRemove = async () => {
    if (selectedItems.length === 0) return;
    Alert.alert("Remove Saved Words", `Delete ${selectedItems.length} items?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          const updated = bookmarks.filter((_, index) => !selectedItems.includes(index));
          await AsyncStorage.setItem('bookmarks_list', JSON.stringify(updated));
          setBookmarks(updated);
          setSelectedItems([]);
      }}
    ]);
  };

  const renderItem = ({ item, index }) => {
    const isSelected = selectedItems.includes(index);
    return (
      <View style={styles.historyCard}>
        <View style={styles.cardTop}>
          {/* Label gaya ng Ugma o Eat/Kain sa image_5bcb79.png */}
          <Text style={styles.labelUnderline}>{item.cebuano || 'Word'}</Text>
          <Text style={styles.cardCategory}>{item.pos || item.part_of_speech || 'Cebuano'}</Text>
          <TouchableOpacity onPress={() => toggleSelect(index)} style={[styles.cardCheckbox, isSelected && styles.checkedBox]} />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.mainWordText}>{item.english}/{item.tagalog}</Text>
          {/* Static date placeholder base sa image reference */}
          <Text style={styles.timestampText}>2026-03-28 23:30</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Brand Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandYellow}>DialectGo</Text>
          <Text style={styles.brandBlack}>Dictionary</Text>
        </View>
        <View style={styles.headerIcons}>
           <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('/Dictionary/History')}>
              <Image source={require('../../../assets/images/history.png')} style={styles.topIcon} />
           </TouchableOpacity>
           <View style={styles.iconCircleActive}>
              <Image source={require('../../../assets/images/star.png')} style={styles.topIcon} />
           </View>
        </View>
      </View>

      {/* Nav Title Row */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Image source={require('../../../assets/icons/back_arrow.png')} style={styles.backImg} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Save Word</Text>
        <View style={{ width: 45 }} />
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved words yet.</Text>
          </View>
        )}
      />

      {/* FLOATING ACTION BAR gaya ng sa image_5bcb79.png */}
      <View style={styles.floatingActionBar}>
         <TouchableOpacity style={styles.deleteMainBtn} onPress={handleRemove}>
            <Text style={styles.deleteBtnText}>Delete</Text>
         </TouchableOpacity>
         <View style={styles.selectAllRow}>
            <Text style={styles.allLabel}>All</Text>
            <TouchableOpacity 
              style={[styles.cardCheckbox, bookmarks.length > 0 && selectedItems.length === bookmarks.length && styles.checkedBox]} 
              onPress={handleSelectAll} 
            />
         </View>
      </View>

      <BottomNav activeTab="Dictionary" />
    </SafeAreaView>
  );
}