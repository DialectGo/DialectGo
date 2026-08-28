import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import TopBar from '../../components/TopBar';
import WikiAssistantModal from '../../shared/components/wiki/WikiAssistantModal';
import SubmissionDetailCard from '../../shared/components/wiki/SubmissionDetailCard';
import SubmissionComments from '../../shared/components/wiki/SubmissionComments';
import { useSubmissionDetail } from '../../shared/hooks/wiki/useSubmissionDetail';

export default function SubmissionDetailScreen({ id }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const {
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
  } = useSubmissionDetail(id);

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TopBar titlePrimary="Dialect" titleSecondary="Wiki" />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 70 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.authorAvatar}>
               <Ionicons name="person-circle" size={40} color="#D1D5DB" />
            </View>
            <View style={styles.headerAuthorInfo}>
              <Text style={styles.headerAuthorName}>
                {submission.profiles?.username || `${submission.profiles?.first_name || ''} ${submission.profiles?.last_name || ''}`.trim() || 'Anonymous'}
              </Text>
              <Text style={styles.headerAuthorDate}>
                {new Date(submission.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkBtn}>
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={bookmarked ? '#FBBF24' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>

        <SubmissionDetailCard
          submission={submission}
          userVote={userVote}
          handleVote={handleVote}
          styles={styles}
        />

        <SubmissionComments
          comments={comments}
          commentText={commentText}
          setCommentText={setCommentText}
          postingComment={postingComment}
          loadingComments={loadingComments}
          handlePostComment={handlePostComment}
          styles={styles}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#9CA3AF' },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { paddingVertical: 8, paddingRight: 12, justifyContent: 'center' },
  authorAvatar: { marginRight: 10 },
  headerAuthorInfo: { justifyContent: 'center' },
  headerAuthorName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  headerAuthorDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  bookmarkBtn: { padding: 6 },

  contentContainer: { paddingVertical: 20, justifyContent: 'center', minHeight: 250 },
  contentHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  contentTitle: { fontSize: 15, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  verifiedStatus: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  verifiedStatusText: { color: '#059669' },
  
  mainTerm: { fontSize: 36, fontWeight: '900', color: '#1F2937', marginBottom: 28 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  translationText: { fontSize: 22, fontWeight: '600', color: '#374151', lineHeight: 30, marginBottom: 20 },
  exampleText: { fontSize: 18, fontWeight: '500', color: '#4B5563', fontStyle: 'italic', lineHeight: 26 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 40 },
  tagBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  tagText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },

  voteSection: { backgroundColor: '#F9FAFB', borderRadius: 20, padding: 22, marginTop: 24, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  voteSectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 18 },
  voteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  voteButton: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, gap: 6 },
  upvoteBtn: { backgroundColor: '#ECFDF5' },
  downvoteBtn: { backgroundColor: '#FEF2F2' },
  activeUpvote: { backgroundColor: '#10B981' },
  activeDownvote: { backgroundColor: '#EF4444' },
  voteBtnText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  activeVoteText: { color: '#FFFFFF' },
  voteCountContainer: { alignItems: 'center' },
  voteCountNumber: { fontSize: 32, fontWeight: '900', color: '#1F2937' },
  voteCountLabel: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  voteHint: { fontSize: 12, color: '#9CA3AF', fontWeight: '500', marginTop: 14 },

  commentsSection: { marginTop: 24 },
  commentsSectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 14 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 16 },
  commentInput: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#1F2937', fontWeight: '500', maxHeight: 100, borderWidth: 1, borderColor: '#F3F4F6' },
  commentSendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FBBF24', justifyContent: 'center', alignItems: 'center' },
  commentSendDisabled: { backgroundColor: '#F3F4F6' },
  noComments: { alignItems: 'center', paddingVertical: 30 },
  noCommentsText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  commentCard: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: '#374151', flex: 1 },
  commentDate: { fontSize: 11, color: '#9CA3AF' },
  commentContent: { fontSize: 14, fontWeight: '500', color: '#4B5563', lineHeight: 21 },

  aiFab: { position: 'absolute', bottom: 30, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBBF24', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 28, gap: 8, shadowColor: '#FBBF24', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 6 },
  aiFabText: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
});
