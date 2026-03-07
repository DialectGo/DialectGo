import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import the Result Component
import ResultDictionary from './ResultDictionary';

// Logo for empty state
import finalLogoImg from '@assets/logo/Logo.png';

export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      setShowResult(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Shared Yellow Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileContainer}>
          <Avatar.Icon size={40} icon="account" backgroundColor="white" color="black" />
        </TouchableOpacity>
      </View>

      {/* 2. Search Bar Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Search Ngani"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text === '') setShowResult(false);
            }}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <MaterialCommunityIcons name="magnify" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Conditional Content */}
      <View style={styles.content}>
        {!showResult ? (
          <View style={styles.emptyState}>
            <Image source={finalLogoImg} style={styles.logo} />
            <Text style={styles.emptyText}>Enter you want to know.</Text>
          </View>
        ) : (
          <ResultDictionary word={searchQuery} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFCB45',
    height: 100,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignSelf: 'flex-end',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -25, // Overlap with header
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFCB45',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
});