import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { fetchSubmissions as fetchSubmissionsService, voteSubmission } from '../../services/wiki/wikiService';

export function useWikiFeed() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter States
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSort, setActiveSort] = useState('newest');
  const [activeType, setActiveType] = useState('All');

  // Modal States
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const fetchSubmissions = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        const filters = {
          sort: activeSort,
          region: activeRegion,
          category: activeCategory,
          type: activeType,
          search,
        };

        const { data, pagination } = await fetchSubmissionsService(pageNum, filters);

        if (append) {
          setSubmissions(prev => [...prev, ...data]);
        } else {
          setSubmissions(data);
        }

        setTotal(pagination.total);
        setHasMore(data.length === 20);
      } catch (err) {
        console.error('[WikiFeed] Fetch error:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeRegion, activeCategory, activeSort, activeType, search]
  );

  // Filter Change
  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchSubmissions(1);
  }, [activeRegion, activeCategory, activeSort, activeType]);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setPage(1);
      fetchSubmissions(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchSubmissions(1);
  };

  const loadMore = () => {
    if (!hasMore || loading) return;

    const nextPage = page + 1;
    setPage(nextPage);
    fetchSubmissions(nextPage, true);
  };

  const handleVote = async (submissionId, voteType) => {
    try {
      const result = await voteSubmission(submissionId, voteType);

      if (result) {
        setSubmissions(prev =>
          prev.map(s =>
            s.id === submissionId
              ? { ...s, upvotes: result.upvotes, status: result.promoted ? 'verified' : s.status }
              : s
          )
        );

        if (result.promoted) {
          Alert.alert('🎉 Verified!', 'This term has been added to the translation corpus!');
        }
      }
    } catch (err) {
      console.error('[WikiFeed] Vote error:', err);
    }
  };

  const handleSubmitSuccess = () => {
    setShowSubmitModal(false);
    setPage(1);
    fetchSubmissions(1);
  };

  return {
    submissions,
    loading,
    refreshing,
    page,
    hasMore,
    total,
    
    search,
    setSearch,
    activeRegion,
    setActiveRegion,
    activeCategory,
    setActiveCategory,
    activeSort,
    setActiveSort,
    activeType,
    setActiveType,
    
    showSubmitModal,
    setShowSubmitModal,
    showAiModal,
    setShowAiModal,
    showFilterMenu,
    setShowFilterMenu,

    onRefresh,
    loadMore,
    handleVote,
    handleSubmitSuccess
  };
}
