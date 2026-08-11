import React, { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, ActivityIndicator, Alert, TextInput, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../shared/lib/supabase';
import TopBar from '../../../shared/components/TopBar';
import WikiAssistantModal from '../../../shared/components/WikiAssistantModal';
import { WIKI_API_BASE } from '../../../shared/config/apiConfig';

export default function SubmissionDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
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

  useEffect(() => {
    fetchDetail();
    fetchComments();
  }, [id]);

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  const fetchDetail = async () => {
    try {
      const session = await getSession();
      if (!session) return;

      const response = await fetch(`${WIKI_API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await response.json();

      if (json.success) {
        setSubmission(json.data);
        setUserVote(json.data.userVote || null);
        setBookmarked(json.data.bookmarked || false);
      }
    } catch (err) {
      console.error('[SubmissionDetail] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const session = await getSession();
      if (!session) return;

      const response = await fetch(`${WIKI_API_BASE}/${id}/comments`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await response.json();

      if (json.success) {
        setComments(json.data);
      }
    } catch (err) {
      console.error('[SubmissionDetail] Comments error:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleVote = async (voteType) => {
    try {
      const session = await getSession();
      if (!session) return;

      const response = await fetch(`${WIKI_API_BASE}/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ vote_type: voteType }),
      });
      const json = await response.json();

      if (json.success) {
        setSubmission(prev => ({
          ...prev,
          upvotes: json.upvotes,
          status: json.promoted ? 'verified' : prev.status,
        }));
        setUserVote(prev => prev === voteType ? null : voteType);

        if (json.promoted) {
          Alert.alert('🎉 Verified!', 'This term has been added to the translation corpus!');
        }
      }
    } catch (err) {
      console.error('[SubmissionDetail] Vote error:', err);
    }
  };

  const handleBookmark = async () => {
    try {
      const session = await getSession();
      if (!session) return;

      const response = await fetch(`${WIKI_API_BASE}/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const json = await response.json();

      if (json.success) {
        setBookmarked(json.bookmarked);
        Alert.alert(
          json.bookmarked ? 'Saved!' : 'Removed',
          json.bookmarked ? 'This post has been added to your bookmarks.' : 'This post was removed from your bookmarks.'
        );
      }
    } catch (err) {
      console.error('[SubmissionDetail] Bookmark error:', err);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || postingComment) return;

    setPostingComment(true);
    try {
      const session = await getSession();
      if (!session) return;

      const response = await fetch(`${WIKI_API_BASE}/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const json = await response.json();

      if (json.success) {
        setCommentText('');
        fetchComments(); // Refresh with profiles
      }
    } catch (err) {
      console.error('[SubmissionDetail] Post comment error:', err);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TopBar titlePrimary="Dialect" titleSecondary="Wiki" />
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 70 }]}>
          <ActivityIndicator size="large" color="#FBBF24" />
        </View>
      </View>
    );
  }

  if (!submission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TopBar titlePrimary="Dialect" titleSecondary="Wiki" />
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 70 }]}>
          <Text style={styles.errorText}>Submission not found</Text>
        </View>
      </View>
    );
  }

  const authorName = submission.profiles?.username
    || `${submission.profiles?.first_name || ''} ${submission.profiles?.last_name || ''}`.trim()
    || 'Anonymous';

  const isQuestion = submission.type === 'Question';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TopBar titlePrimary="Dialect" titleSecondary="Wiki" />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 70 }]}>
        {/* Back + Bookmark row */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
            <Text style={styles.backText}>Back to Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkBtn}>
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={bookmarked ? '#FBBF24' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>

        {/* Main card */}
        <View style={styles.mainCard}>
          {/* Type + Status row */}
          <View style={styles.badgeRow}>
            {isQuestion && (
              <View style={styles.questionBadge}>
                <Ionicons name="help-circle" size={14} color="#7C3AED" />
                <Text style={styles.questionBadgeText}>Question</Text>
              </View>
            )}
            <View style={[styles.statusBadge, submission.status === 'verified' && styles.verifiedStatus]}>
              <Ionicons
                name={submission.status === 'verified' ? 'checkmark-circle' : 'time-outline'}
                size={14}
                color={submission.status === 'verified' ? '#059669' : '#D97706'}
              />
              <Text style={[styles.statusText, submission.status === 'verified' && styles.verifiedStatusText]}>
                {submission.status === 'verified' ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>

          <Text style={styles.sourceTerm}>{submission.source_term}</Text>

          {/* Meta tags */}
          <View style={styles.metaRow}>
            <View style={styles.regionTag}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.regionTagText}>{submission.region}</Text>
            </View>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{submission.category}</Text>
            </View>
            {submission.sentiment_tag && (
              <View style={styles.sentimentTag}>
                <Text style={styles.sentimentTagText}>{submission.sentiment_tag}</Text>
              </View>
            )}
          </View>

          {/* Translation / Context */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {isQuestion ? 'CONTEXT' : 'STANDARD TRANSLATION'}
            </Text>
            <Text style={styles.translationText}>{submission.translation}</Text>
          </View>

          {/* Usage Example */}
          {submission.usage_example && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>USAGE EXAMPLE</Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleText}>"{submission.usage_example}"</Text>
              </View>
            </View>
          )}

          {/* Author */}
          <View style={styles.authorRow}>
            <View style={styles.authorInfo}>
              <Ionicons name="person-circle-outline" size={20} color="#9CA3AF" />
              <Text style={styles.authorText}>Submitted by @{authorName}</Text>
            </View>
            <View style={styles.dateViewsInfo}>
              <Text style={styles.dateText}>
                {new Date(submission.created_at).toLocaleDateString()}
              </Text>
              <Text style={styles.viewsText}>
                • {submission.views || 0} views
              </Text>
            </View>
          </View>
        </View>

        {/* Voting section */}
        <View style={styles.voteSection}>
          <Text style={styles.voteSectionTitle}>Community Rating</Text>
          <View style={styles.voteRow}>
            <TouchableOpacity
              style={[styles.voteButton, styles.upvoteBtn, userVote === 1 && styles.activeUpvote]}
              onPress={() => handleVote(1)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={userVote === 1 ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
                size={28}
                color={userVote === 1 ? '#FFFFFF' : '#10B981'}
              />
              <Text style={[styles.voteBtnText, userVote === 1 && styles.activeVoteText]}>Upvote</Text>
            </TouchableOpacity>

            <View style={styles.voteCountContainer}>
              <Text style={styles.voteCountNumber}>{submission.upvotes || 0}</Text>
              <Text style={styles.voteCountLabel}>votes</Text>
            </View>

            <TouchableOpacity
              style={[styles.voteButton, styles.downvoteBtn, userVote === -1 && styles.activeDownvote]}
              onPress={() => handleVote(-1)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={userVote === -1 ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
                size={28}
                color={userVote === -1 ? '#FFFFFF' : '#EF4444'}
              />
              <Text style={[styles.voteBtnText, userVote === -1 && styles.activeVoteText]}>Downvote</Text>
            </TouchableOpacity>
          </View>
          {!isQuestion && (
            <Text style={styles.voteHint}>10 upvotes = auto-verified into the corpus</Text>
          )}
        </View>

        {/* ─── Discussion Section ─── */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsSectionTitle}>
            Discussion ({comments.length})
          </Text>

          {/* Comment Input */}
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your thoughts, perspectives, or suggestions..."
              placeholderTextColor="#9CA3AF"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[styles.commentSendBtn, (!commentText.trim() || postingComment) && styles.commentSendDisabled]}
              onPress={handlePostComment}
              disabled={!commentText.trim() || postingComment}
            >
              {postingComment ? (
                <ActivityIndicator size="small" color="#1F2937" />
              ) : (
                <Ionicons name="send" size={18} color={commentText.trim() ? '#1F2937' : '#D1D5DB'} />
              )}
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {loadingComments ? (
            <ActivityIndicator size="small" color="#FBBF24" style={{ paddingVertical: 20 }} />
          ) : comments.length === 0 ? (
            <View style={styles.noComments}>
              <Ionicons name="chatbubble-outline" size={32} color="#D1D5DB" />
              <Text style={styles.noCommentsText}>No comments yet. Be the first to share!</Text>
            </View>
          ) : (
            comments.map(comment => {
              const commentAuthor = comment.profiles?.username
                || `${comment.profiles?.first_name || ''} ${comment.profiles?.last_name || ''}`.trim()
                || 'Anonymous';

              return (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <Ionicons name="person-circle-outline" size={18} color="#9CA3AF" />
                    <Text style={styles.commentAuthor}>@{commentAuthor}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* AI Assistant FAB */}
      <TouchableOpacity
        style={styles.aiFab}
        activeOpacity={0.85}
        onPress={() => setShowAssistant(true)}
      >
        <Ionicons name="sparkles" size={22} color="#1F2937" />
        <Text style={styles.aiFabText}>Ask AI</Text>
      </TouchableOpacity>

      <WikiAssistantModal
        visible={showAssistant}
        onClose={() => setShowAssistant(false)}
        submissionId={id}
        submissionTitle={submission.source_term}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  bookmarkBtn: {
    padding: 6,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  questionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  questionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  verifiedStatus: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  verifiedStatusText: {
    color: '#059669',
  },
  sourceTerm: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  regionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  regionTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  sentimentTag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sentimentTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  section: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  translationText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 24,
  },
  exampleBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FBBF24',
  },
  exampleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    justifyContent: 'space-between',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateViewsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewsText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  voteSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 22,
    marginTop: 18,
    alignItems: 'center',
  },
  voteSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 18,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  voteButton: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 6,
  },
  upvoteBtn: {
    backgroundColor: '#ECFDF5',
  },
  downvoteBtn: {
    backgroundColor: '#FEF2F2',
  },
  activeUpvote: {
    backgroundColor: '#10B981',
  },
  activeDownvote: {
    backgroundColor: '#EF4444',
  },
  voteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  activeVoteText: {
    color: '#FFFFFF',
  },
  voteCountContainer: {
    alignItems: 'center',
  },
  voteCountNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
  },
  voteCountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  voteHint: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 14,
  },

  // ─── Comments ──────────────────────────────────────────────────────────────
  commentsSection: {
    marginTop: 18,
  },
  commentsSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 14,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  commentSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentSendDisabled: {
    backgroundColor: '#F3F4F6',
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  commentCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
  commentDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  commentContent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    lineHeight: 21,
  },

  // ─── AI FAB ────────────────────────────────────────────────────────────────
  aiFab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBBF24',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#FBBF24',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  aiFabText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
});
