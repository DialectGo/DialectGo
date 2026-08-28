import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import TopBar from '../../components/TopBar';
import { colors } from '../../shared/theme/colorPalette';
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
          commentsCount={comments.length}
          styles={styles}
        />

        <SubmissionComments
          comments={comments}
          loadingComments={loadingComments}
          styles={styles}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating AI Fab positioned above the bottom input */}
      <TouchableOpacity
        style={[styles.aiFab, { bottom: insets.bottom + 80 }]}
        activeOpacity={0.85}
        onPress={() => setShowAssistant(true)}
      >
        <Ionicons name="sparkles" size={22} color="#1F2937" />
        <Text style={styles.aiFabText}>Ask AI</Text>
      </TouchableOpacity>

      {/* Facebook style fixed comment input */}
      <View style={[styles.bottomInputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.commentInputWrapperFb}>
          <TextInput
            style={styles.commentInputFb}
            placeholder="Share your thoughts, perspectives, or suggestions..."
            placeholderTextColor="#9CA3AF"
            value={commentText}
            onChangeText={setCommentText}
            multiline={commentText.length > 0}
            maxLength={2000}
          />
          {commentText.trim().length > 0 && (
            <TouchableOpacity
              style={styles.commentSendBtnFb}
              onPress={handlePostComment}
              disabled={postingComment}
            >
              {postingComment ? (
                <ActivityIndicator size="small" color={colors.primaryDeep} />
              ) : (
                <Ionicons name="send" size={20} color={colors.primaryDeep} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <WikiAssistantModal
        visible={showAssistant}
        onClose={() => setShowAssistant(false)}
        submissionId={id}
        submissionTitle={submission.source_term}
      />
    </KeyboardAvoidingView>
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
  headerAuthorName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  headerAuthorDate: { fontSize: 11, color: colors.textHint, marginTop: 2 },
  bookmarkBtn: { padding: 6 },

  contentContainer: { 
    backgroundColor: colors.surface,
    padding: 24, 
    justifyContent: 'center', 
    minHeight: 180,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8
  },
  contentHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  contentTitle: { fontSize: 13, fontWeight: '700', color: colors.textHint, letterSpacing: 0.5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  verifiedStatus: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 11, fontWeight: '700', color: colors.primaryDeep },
  verifiedStatusText: { color: '#059669' },
  
  mainTerm: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.textHint, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  translationText: { fontSize: 18, fontWeight: '600', color: colors.textSecondary, lineHeight: 26, marginBottom: 12 },
  exampleText: { fontSize: 16, fontWeight: '500', color: colors.textSecondary, fontStyle: 'italic', lineHeight: 24 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24 },
  tagBadge: { 
    backgroundColor: colors.surfaceLight, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGold
  },
  tagText: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },

  engagementRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 4, gap: 24, paddingBottom: 16 },
  engagementBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  engagementText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },

  commentsSection: { marginTop: 16 },
  commentsSectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 14 },
  noComments: { alignItems: 'center', paddingVertical: 30 },
  noCommentsText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  commentCard: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: '#374151', flex: 1 },
  commentDate: { fontSize: 11, color: '#9CA3AF' },
  commentContent: { fontSize: 14, fontWeight: '500', color: '#4B5563', lineHeight: 21 },

  bottomInputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  commentAvatarFb: { marginRight: 10, paddingBottom: 4 },
  commentInputWrapperFb: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 14, minHeight: 40, maxHeight: 100 },
  commentInputFb: { flex: 1, fontSize: 15, color: '#1F2937', paddingTop: 10, paddingBottom: 10, paddingRight: 8 },
  commentSendBtnFb: { paddingLeft: 8, paddingVertical: 8 },

  aiFab: { position: 'absolute', right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBBF24', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 28, gap: 8, shadowColor: '#FBBF24', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 6 },
  aiFabText: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
});
