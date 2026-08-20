import { useState, useEffect, useCallback } from 'react';
import { fetchDailyWord } from '../services/wordService';
import { getWeeklyStatus } from '../utils/dateUtils';
import { useProfileContext } from '../contexts/profile/ProfileContext';

export const useHomeData = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [wordOfDay, setWordOfDay] = useState(null);
  
  // Get all profile data from the global context
  const { 
    firstName, 
    userAvatar, 
    streakCount, 
    activeDays, 
    refreshProfile 
  } = useProfileContext();

  const [weeklyStatus, setWeeklyStatus] = useState([false, false, false, false, false, false, false]);

  const loadWordData = async (forceRefresh = false) => {
    try {
      const wordResult = await fetchDailyWord(forceRefresh);
      if (wordResult) setWordOfDay(wordResult);
    } catch (error) {
      console.error("Home Data Word Error:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initializeData = async () => {
      setLoading(true);
      await loadWordData(false);
      if (isMounted) setLoading(false);
    };
    initializeData();
    return () => { isMounted = false; };
  }, []);

  // Whenever activeDays updates from context, recalculate weekly status
  useEffect(() => {
    setWeeklyStatus(getWeeklyStatus(activeDays || []));
  }, [activeDays]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWordData(true);
    refreshProfile(); 
    setRefreshing(false);
  }, [refreshProfile]);

  return {
    loading,
    refreshing,
    wordOfDay,
    userName: firstName || 'User',
    userAvatar,
    streakData: { streak: streakCount, activeDays },
    weeklyStatus,
    handleRefresh
  };
};
