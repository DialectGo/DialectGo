import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SubmissionDetailCard({
  submission,
  userVote,
  handleVote,
  styles
}) {
  const authorName = submission.profiles?.username
    || `${submission.profiles?.first_name || ''} ${submission.profiles?.last_name || ''}`.trim()
    || 'Anonymous';

  const isQuestion = submission.type === 'Question';

  return (
    <View>
      <View style={styles.mainCard}>
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {isQuestion ? 'CONTEXT' : 'STANDARD TRANSLATION'}
          </Text>
          <Text style={styles.translationText}>{submission.translation}</Text>
        </View>

        {submission.usage_example && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>USAGE EXAMPLE</Text>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>"{submission.usage_example}"</Text>
            </View>
          </View>
        )}

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
