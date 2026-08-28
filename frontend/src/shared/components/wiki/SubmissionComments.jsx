import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SubmissionComments({
  comments,
  loadingComments,
  styles
}) {
  return (
    <View style={styles.commentsSection}>
      <Text style={styles.commentsSectionTitle}>
        Discussion ({comments.length})
      </Text>

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
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentAvatarCol}>
                <Ionicons name="person-circle" size={32} color="#D1D5DB" />
              </View>
              <View style={styles.commentContentWrapper}>
                <View style={styles.commentHeaderRow}>
                  <Text style={styles.commentAuthor}>{commentAuthor}</Text>
                  <Text style={styles.commentDot}> · </Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}
