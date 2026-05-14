// shared/hooks/useDictionaryBrowse.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const BROWSE_API_URL = 'http://192.168.1.53:5001/api/dictionary/browse';

export function useDictionaryBrowse(searchQuery) {
  const [browseData, setBrowseData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);

  const fetchBrowseData = async (pageNum, isInitial = false) => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${BROWSE_API_URL}?page=${pageNum}&limit=15${selectedLang ? `&lang=${selectedLang}` : ''}${selectedLetter ? `&letter=${selectedLetter}` : ''}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        setBrowseData(prev => isInitial ? result.data : [...prev, ...result.data]);
        setHasMore(result.data.length === 15);
      } else {
        if (isInitial) setBrowseData([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Browse Fetch Error:", err);
    } finally {
      setIsFetchingMore(false);
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