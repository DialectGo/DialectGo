import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colorPalette';

export default function SubmissionDetailCard({
  submission,
  userVote,
  handleVote,
  commentsCount,
  styles
}) {
  const isQuestion = submission.type === 'Question';

  return (
    <View>
      <View style={styles.contentContainer}>
        {/* Title and Status Row */}
        <View style={styles.contentHeaderRow}>
          <Text style={styles.contentTitle}>
            {isQuestion ? 'Question' : 'Word Entry'}
          </Text>
          <View style={[styles.statusBadge, submission.status === 'verified' && styles.verifiedStatus]}>
            <Ionicons
              name={submission.status === 'verified' ? 'checkmark-circle' : 'time-outline'}
              size={14}
              color={submission.status === 'verified' ? '#059669' : '#D97706'}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusText, submission.status === 'verified' && styles.verifiedStatusText]}>
              {submission.status === 'verified' ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Source Term */}
        <Text style={styles.mainTerm}>{submission.source_term}</Text>

        {/* Translation Section */}
        <Text style={styles.sectionTitle}>
          {isQuestion ? 'Context' : 'Standard Translation'}
        </Text>
        <Text style={styles.translationText}>{submission.translation}</Text>

        {/* Usage Example (Optional) */}
        {submission.usage_example && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Usage Example</Text>
            <Text style={styles.exampleText}>"{submission.usage_example}"</Text>
          </View>
        )}

        {/* Tags Row */}
        <View style={styles.tagsContainer}>
          {submission.region && (
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{submission.region}</Text>
            </View>
          )}
          {submission.category && (
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{submission.category}</Text>
            </View>
          )}
          {submission.sentiment_tag && (
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{submission.sentiment_tag}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Engagement Row (Likes, Comments, Views) */}
      <View style={styles.engagementRow}>
        <TouchableOpacity style={styles.engagementBtn} onPress={() => handleVote(userVote === 1 ? 0 : 1)}>
          <Ionicons 
            name={userVote === 1 ? 'thumbs-up' : 'thumbs-up-outline'} 
            size={20} 
            color={userVote === 1 ? colors.primaryDeep : colors.textHint} 
          />
          <Text style={styles.engagementText}>{submission.upvotes || 0}</Text>
        </TouchableOpacity>

        <View style={styles.engagementBtn}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textHint} />
          <Text style={styles.engagementText}>{commentsCount || 0}</Text>
        </View>

        <View style={styles.engagementBtn}>
          <Ionicons name="eye-outline" size={20} color={colors.textHint} />
          <Text style={styles.engagementText}>{submission.views || 0}</Text>
        </View>
      </View>
    </View>
  );
}
