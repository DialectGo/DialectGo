import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { fetchActivities as fetchActivitiesService } from '../../services/profile/activitiesService';

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
    try {
      const data = await fetchActivitiesService();
      setActivities(data);
    } catch (error) {
      console.error('[Activities] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToWiki = (id) => {
    if (id) router.push({ pathname: '/(tabs)/Wiki/SubmissionDetail', params: { id } });
  };

  return {
    activities,
    loading,
    activeTab,
    setActiveTab,
    navigateToWiki
  };
};
