// shared/hooks/useOfflineSearch.jsx

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import localDictionary from '../../../../assets/data/dictionary/cebuano_dictionary.json';
export function useOfflineSearch(searchQuery, isGuestMode) {
  const [isOffline, setIsOffline] = useState(false);

  const [offlineResults, setOfflineResults] = useState([]);
  const [offlineBrowseData, setOfflineBrowseData] = useState([]);

  // NETWORK DETECTION
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Helper mapper
  const mapDictionaryItem = (item, index) => ({
    id: `offline-${index}`,
    word_term: item.cebuano,
    definition: item.english,
    part_of_speech: item.part_of_speech,
    example_usage: item.examples?.[0]?.cebuano || '',
    phonetic_transcription: item.pronunciation?.cebuano || '',
    language_id: 3, // Cebuano
    translations: [
      {
        target_entry: {
          word_term: item.tagalog,
          language_id: 2, // Tagalog
          example_usage: item.examples?.[0]?.tagalog || '',
        },
      },
      {
        target_entry: {
          word_term: item.english,
          language_id: 1, // English
          example_usage: item.examples?.[0]?.english || '',
        },
      },
    ],
  });

  // OFFLINE BROWSE DATA
  useEffect(() => {
    if (isGuestMode) {
      const mappedBrowse = localDictionary.map((item, index) =>
        mapDictionaryItem(item, index)
      );

      setOfflineBrowseData(mappedBrowse);
    } else {
      setOfflineBrowseData([]);
    }
  }, [isGuestMode]);

  // OFFLINE SEARCH
  useEffect(() => {
    if (isGuestMode && searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();

      const filtered = localDictionary.filter(item =>
        item.cebuano.toLowerCase().includes(term) ||
        item.tagalog.toLowerCase().includes(term) ||
        item.english.toLowerCase().includes(term)
      );

      const mapped = filtered.map((item, index) =>
        mapDictionaryItem(item, index)
      );

      setOfflineResults(mapped);
    } else {
      setOfflineResults([]);
    }
  }, [searchQuery, isGuestMode]);

  return {
    isOffline,
    offlineResults,
    offlineBrowseData,
  };
}