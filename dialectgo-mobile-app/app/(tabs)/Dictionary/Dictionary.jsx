import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, TextInput, Image, ActivityIndicator, Keyboard } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ResultDictionary from './ResultDictionary';
import finalLogoImg from '@assets/logo/Logo.png';

function SearchHeader({ title, onHistory, onSaved }) {
  return (
    <View style={styles.headerTitleContainer}>
      <View style={styles.titleWrapper}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.roundBtn} onPress={onHistory}>
          <MaterialCommunityIcons name="history" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.roundBtn} onPress={onSaved}>
          <MaterialCommunityIcons name="star" size={28} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SearchBar({ value, onChangeText, onSearch, onClear }) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Search Ngani (e.g. Gwapa, Eat, Ano)"
          placeholderTextColor="#7C7C7C"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.iconButton}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#5D4037" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onSearch} style={styles.iconButton}>
          <MaterialCommunityIcons name="magnify" size={26} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyState({ image, message }) {
  return (
    <View style={styles.emptyState}>
      <Image source={image} style={styles.logo} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function LoadingState({ message }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator animating={true} color="#FFCB45" size="large" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}


export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (searchQuery.trim().length === 0) return;
    
    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await fetch(`http://192.168.1.43:5001/api/dictionary/${searchQuery.trim()}`);
      
      if (response.ok) {
        const result = await response.json();
        setResultData(result.data); 
        setShowResult(true);
      } else {
        alert("Word not found in DialectoGo database.");
        setShowResult(false);
      }
    } catch (error) {
      console.error("Search Error:", error);
      alert("Connection failed. Ensure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResult(false);
    setResultData(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchHeader 
      title="DialectoGo Dictionary" 
      onHistory={() => console.log("History Clicked")} 
      onSaved={() => router.push('/Dictionary/SaveWords')}
  />

      <SearchBar 
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          if (text === '') clearSearch();
        }}
        onSearch={handleSearch}
        onClear={clearSearch}
      />

      <View style={styles.content}>
        {loading ? (
          <LoadingState message="Fetching translations..." />
        ) : !showResult ? (
          <EmptyState 
            image={finalLogoImg} 
            message="Enter a word to explore its meaning." 
          />
        ) : (
          <ResultDictionary data={resultData} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  headerTitleContainer: { 
    flexDirection: 'row',       // Align children horizontally
    alignItems: 'center',       // Center them vertically relative to each other
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    marginTop: 10,
  },
  titleWrapper: {
    flex: 1,                    // Allow text to take up remaining space
    marginRight: 10,            // Gap between text and buttons
  },
  headerTitle: { 
    fontSize: 32,               // Adjusted slightly to fit better on one line
    color: '#333', 
    fontWeight: '900',
    lineHeight: 36,
  },
  headerButtons: {
    flexDirection: 'row',       // Align the two buttons horizontally
    gap: 8,                     // Space between the two buttons
  },
  roundBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFCB45',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,               // Shadow for Android
    shadowColor: '#000',        // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  // ... keep the rest of your styles (searchContainer, input, etc.)
  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFCB45',
    borderRadius: 15, 
    paddingHorizontal: 15,
    height: 55,
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: { flex: 1, fontSize: 16, color: '#333', fontWeight: '500' },
  iconButton: { marginLeft: 10 },
  content: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666', fontSize: 14 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  logo: { width: 140, height: 140, resizeMode: 'contain', opacity: 0.3 },
  emptyText: { marginTop: 15, fontSize: 16, color: '#9CA3AF', textAlign: 'center' },
});