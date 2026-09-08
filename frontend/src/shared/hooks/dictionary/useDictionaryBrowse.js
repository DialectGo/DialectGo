// shared/hooks/useDictionaryBrowse.js
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../api/supabase';
import { endpoints } from '../../api/client';

const BROWSE_API_URL = endpoints.DICTIONARY_BROWSE;

export function useDictionaryBrowse(searchQuery) {
  const [browseData, setBrowseData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const fetchIdRef = useRef(0);

  const fetchBrowseData = async (pageNum, isInitial = false) => {
    // Only block pagination requests if currently fetching. 
    // Initial fetches (like filter changes) must ALWAYS proceed.
    if (isFetchingMore && !isInitial) return;
    
    // Increment and capture the ID for this specific request
    fetchIdRef.current += 1;
    const currentFetchId = fetchIdRef.current;
    
    const cacheKey = `dialectgo_dict_browse_${selectedLang || 'all'}_${selectedLetter || 'all'}`;

    // INSTANT HYDRATION: If initial load, immediately populate with cached data while fetching fresh data
    if (isInitial && pageNum === 1) {
      try {
        const cachedStr = await AsyncStorage.getItem(cacheKey);
        // Only hydrate if another request hasn't superseded us
        if (cachedStr && currentFetchId === fetchIdRef.current) {
          setBrowseData(JSON.parse(cachedStr));
        }
      } catch (e) {
        // ignore cache errors
      }
    }

    setIsFetchingMore(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return; // Early return if logged out to avoid crash
      }
      const url = `${BROWSE_API_URL}?page=${pageNum}&limit=15${selectedLang ? `&lang=${selectedLang}` : ''}${selectedLetter ? `&letter=${selectedLetter}` : ''}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await response.json();

      // Only update state if this is still the most recent request
      if (currentFetchId !== fetchIdRef.current) return;

      if (result.success && result.data.length > 0) {
        setBrowseData(prev => isInitial ? result.data : [...prev, ...result.data]);
        setHasMore(result.data.length === 15);
        
        // Cache the fresh first page for instant hydration next time
        if (isInitial && pageNum === 1) {
          AsyncStorage.setItem(cacheKey, JSON.stringify(result.data)).catch(() => {});
        }
      } else {
        if (isInitial) setBrowseData([]);
        setHasMore(false);
      }
    } catch (err) {
      if (currentFetchId === fetchIdRef.current) {
        console.error("Browse Fetch Error:", err);
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsFetchingMore(false);
      }
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setPage(1);
      fetchBrowseData(1, true);
    }
  }, [selectedLang, selectedLetter, searchQuery]);

  const handleLoadMore = () => {
    if (hasMore && !isFetchingMore && !searchQuery.trim()) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBrowseData(nextPage);
    }
  };

  return {
    browseData,
    isFetchingMore,
    handleLoadMore,
    filters: { selectedLang, setSelectedLang, selectedLetter, setSelectedLetter }
  };
}