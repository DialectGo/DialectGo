import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import BottomNav from '../../../shared/components/BottomNav';
import { styles } from '../../../shared/styles/HistoryStyles';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('history_list');
      if (data) setHistoryItems(JSON.parse(data));
    } catch (e) {
      console.error("Failed to load history", e);
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
    if (selectedItems.length === historyItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(historyItems.map((_, index) => index));
    }
  };

  const handleRemove = async () => {
    if (selectedItems.length === 0) return;
    Alert.alert("Remove History", "Delete selected items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          const updated = historyItems.filter((_, index) => !selectedItems.includes(index));
          await AsyncStorage.setItem('history_list', JSON.stringify(updated));
          setHistoryItems(updated);
          setSelectedItems([]);
      }}
    ]);
  };

  const renderItem = ({ item, index }) => {
    const isSelected = selectedItems.includes(index);
    return (
      <View style={styles.historyCard}>
        <View style={styles.cardTop}>
          <Text style={styles.labelUnderline}>{item.cebuano ? 'Ugma' : 'Eat/Kain'}</Text>
          <Text style={styles.cardCategory}>{item.cebuano ? 'Cebuano' : 'English/Tagalog'}</Text>
          <View style={styles.cardActions}>
             <Image source={require('../../../assets/icons/star.png')} style={[styles.cardStar, {tintColor: '#FFD54F'}]} />
             <TouchableOpacity onPress={() => toggleSelect(index)} style={[styles.cardCheckbox, isSelected && styles.checkedBox]} />
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.mainWordText}>{item.cebuano || item.tagalog}</Text>
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
           <View style={styles.iconCircleActive}>
              <Image source={require('../../../assets/images/history.png')} style={styles.topIcon} />
           </View>
           <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('/Dictionary/SaveWords')}>
              <Image source={require('../../../assets/images/star.png')} style={styles.topIcon} />
           </TouchableOpacity>
        </View>
      </View>

      {/* Nav Title Row */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Image source={require('../../../assets/icons/back_arrow.png')} style={styles.backImg} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>See History</Text>
        <View style={{ width: 45 }} />
      </View>

      <FlatList
        data={historyItems}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />

      {/* FLOATING ACTION BAR gaya ng sa image */}
      <View style={styles.floatingActionBar}>
         <TouchableOpacity style={styles.deleteMainBtn} onPress={handleRemove}>
            <Text style={styles.deleteBtnText}>Delete</Text>
         </TouchableOpacity>
         <View style={styles.selectAllRow}>
            <Text style={styles.allLabel}>All</Text>
            <TouchableOpacity 
              style={[styles.cardCheckbox, selectedItems.length === historyItems.length && styles.checkedBox]} 
              onPress={handleSelectAll} 
            />
         </View>
      </View>

      <BottomNav activeTab="Dictionary" />
    </SafeAreaView>
  );
}