import { useState, useEffect, useCallback } from 'react';
import { fetchUserProfile } from '../services/profile/userService';
import { fetchDailyWord } from '../services/wordService';
import { fetchStreak } from '../services/streakService';
import { getWeeklyStatus } from '../utils/dateUtils';

// Hardcoded avatars or can be abstracted to a constants file
const availableAvatars = [
  { id: 1, name: 'maria_clara.png', source: require('../../../assets/avatars/maria_clara.png') },
  { id: 2, name: '1.png', source: require('../../../assets/avatars/1.png') },
  { id: 3, name: '2.png', source: require('../../../assets/avatars/2.png') },
  { id: 4, name: '3.png', source: require('../../../assets/avatars/3.png') },
  { id: 5, name: '4.png', source: require('../../../assets/avatars/4.png') },
];

/**
 * Orchestrator hook for all data required on the Home Screen.
 * Encapsulates state management, data fetching, and refresh routines.
 */
export const useHomeData = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [wordOfDay, setWordOfDay] = useState(null);
  const [userName, setUserName] = useState('User');
  const [userAvatar, setUserAvatar] = useState(availableAvatars[0].source);
  
  const [streakData, setStreakData] = useState({ streak: 0, activeDays: [] });
  const [weeklyStatus, setWeeklyStatus] = useState([false, false, false, false, false, false, false]);

  const loadAllData = async (forceRefresh = false) => {
    try {
      const [profileResult, wordResult, streakResult] = await Promise.all([
        fetchUserProfile(),
        fetchDailyWord(forceRefresh),
        fetchStreak()
      ]);

      if (profileResult) {
        setUserName(profileResult.first_name || 'User');
        if (profileResult.profile_avatar_url) {
          const matched = availableAvatars.find(a => a.name === profileResult.profile_avatar_url);
          if (matched) {
            setUserAvatar(matched.source);
          } else if (profileResult.profile_avatar_url.startsWith('http')) {
            setUserAvatar({ uri: profileResult.profile_avatar_url });
          }
        }
      }

      if (wordResult) {
        setWordOfDay(wordResult);
      }

      if (streakResult) {
        setStreakData(streakResult);
        setWeeklyStatus(getWeeklyStatus(streakResult.activeDays || []));
      }
    } catch (error) {
      console.error("Home Data Orchestrator Error:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initializeData = async () => {
      setLoading(true);
      await loadAllData(false);
      if (isMounted) setLoading(false);
    };
    initializeData();
    return () => { isMounted = false; };
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData(true);
    setRefreshing(false);
  }, []);

  return {
    loading,
    refreshing,
    wordOfDay,
    userName,
    userAvatar,
    streakData,
    weeklyStatus,
    handleRefresh
  };
};
