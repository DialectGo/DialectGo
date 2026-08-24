import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WikiFeedCard({ item, router, handleVote, styles }) {
  const authorName =
    item.profiles?.username ||
    `${item.profiles?.first_name || ''} ${item.profiles?.last_name || ''}`.trim() ||
    'Anonymous';

  const isQuestion = item.type === 'Question';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isQuestion && styles.questionCard,
      ]}
      activeOpacity={0.75}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/Wiki/SubmissionDetail',
          params: { id: item.id },
        })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.termContainer}>
          {isQuestion && (
            <Ionicons name="help-circle" size={18} color="#7C3AED" />
          )}

          <Text style={styles.sourceTerm} numberOfLines={2}>
            {item.source_term}
          </Text>
        </View>

        <View style={[styles.regionBadge, item.status === 'verified' && styles.verifiedBadge]}>
          <Text style={[styles.regionBadgeText, item.status === 'verified' && styles.verifiedBadgeText]}>
            {item.status === 'verified' ? '✓ Verified' : item.region}
          </Text>
        </View>
      </View>

      <Text style={styles.translation} numberOfLines={2}>
        {item.translation}
      </Text>

      <View style={styles.tagsRow}>
        {isQuestion && (
          <View style={styles.questionChip}>
            <Text style={styles.questionChipText}>Question</Text>
          </View>
        )}

        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{item.category}</Text>
        </View>

        {item.sentiment_tag && (
          <View style={styles.sentimentChip}>
            <Text style={styles.sentimentChipText}>{item.sentiment_tag}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.voteSection}>
          <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(item.id, 1)}>
            <Ionicons name="arrow-up-circle-outline" size={21} color="#10B981" />
            <Text style={styles.voteCount}>{item.upvotes || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(item.id, -1)}>
            <Ionicons name="arrow-down-circle-outline" size={21} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <Text style={styles.authorText} numberOfLines={1}>
          by @{authorName}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
