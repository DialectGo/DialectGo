import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { fetchActivities as fetchActivitiesService } from '../../services/profile/activitiesService';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const useActivities = () => {
  const [activities, setActivities] = useState({
    posts: [],
    translations: [],
    bookmarks: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Posts');
  const router = useRouter();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    let hasCache = false;
    try {
      // 1. Try to load from cache
      const cachedStr = await AsyncStorage.getItem('dialectgo_activities_cache');
      if (cachedStr) {
        setActivities(JSON.parse(cachedStr));
        setLoading(false);
        hasCache = true;
      }
    } catch (e) {
      // ignore
    }

    // Unblock UI immediately so the user isn't stuck on a spinner
    if (!hasCache) setLoading(false);

    try {
      // 2. Fetch fresh data from server
      const data = await fetchActivitiesService();
      setActivities(data);
      AsyncStorage.setItem('dialectgo_activities_cache', JSON.stringify(data)).catch(() => {});
    } catch (error) {
      console.error('[Activities] Fetch error:', error);
    }
  };

  const navigateToWiki = (id) => {
    if (id) router.push({ pathname: '/(tabs)/Wiki/[id]', params: { id } });
  };

  return {
    activities,
    loading,
    activeTab,
    setActiveTab,
    navigateToWiki
  };
};
