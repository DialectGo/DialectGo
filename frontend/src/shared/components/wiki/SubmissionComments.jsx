import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SubmissionComments({
  comments,
  commentText,
  setCommentText,
  postingComment,
  loadingComments,
  handlePostComment,
  styles
}) {
  return (
    <View style={styles.commentsSection}>
      <Text style={styles.commentsSectionTitle}>
        Discussion ({comments.length})
      </Text>

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
  );
}
