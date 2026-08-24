import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  fetchSubmissionDetail,
  fetchSubmissionComments,
  voteSubmission,
  bookmarkSubmission,
  postSubmissionComment
} from '../../services/wiki/wikiService';

export function useSubmissionDetail(id) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  // AI Assistant
  const [showAssistant, setShowAssistant] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const data = await fetchSubmissionDetail(id);
      if (data) {
        setSubmission(data);
        setUserVote(data.userVote || null);
        setBookmarked(data.bookmarked || false);
      }
    } catch (err) {
      console.error('[useSubmissionDetail] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const data = await fetchSubmissionComments(id);
      setComments(data || []);
    } catch (err) {
      console.error('[useSubmissionDetail] Comments error:', err);
    } finally {
      setLoadingComments(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDetail();
      fetchComments();
    }
  }, [id, fetchDetail, fetchComments]);

  const handleVote = async (voteType) => {
    try {
      const result = await voteSubmission(id, voteType);
      if (result) {
        setSubmission(prev => ({
          ...prev,
          upvotes: result.upvotes,
          status: result.promoted ? 'verified' : prev.status,
        }));
        setUserVote(prev => prev === voteType ? null : voteType);

        if (result.promoted) {
          Alert.alert('🎉 Verified!', 'This term has been added to the translation corpus!');
        }
      }
    } catch (err) {
      console.error('[useSubmissionDetail] Vote error:', err);
    }
  };

  const handleBookmark = async () => {
    try {
      const result = await bookmarkSubmission(id);
      if (result) {
        setBookmarked(result.bookmarked);
        Alert.alert(
          result.bookmarked ? 'Saved!' : 'Removed',
          result.bookmarked ? 'This post has been added to your bookmarks.' : 'This post was removed from your bookmarks.'
        );
      }
    } catch (err) {
      console.error('[useSubmissionDetail] Bookmark error:', err);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || postingComment) return;

    setPostingComment(true);
    try {
      const result = await postSubmissionComment(id, commentText.trim());
      if (result) {
        setCommentText('');
        fetchComments(); // Refresh with profiles
      }
    } catch (err) {
      console.error('[useSubmissionDetail] Post comment error:', err);
    } finally {
      setPostingComment(false);
    }
  };

  return {
    submission,
    loading,
    userVote,
    bookmarked,
    comments,
    commentText,
    setCommentText,
    postingComment,
    loadingComments,
    showAssistant,
    setShowAssistant,
    handleVote,
    handleBookmark,
    handlePostComment,
  };
}
