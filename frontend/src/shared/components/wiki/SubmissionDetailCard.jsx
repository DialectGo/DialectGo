import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SubmissionDetailCard({
  submission,
  userVote,
  handleVote,
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
    </View>
  );
}
