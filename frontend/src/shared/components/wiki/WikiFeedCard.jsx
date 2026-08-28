import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { availableAvatars } from '../../hooks/profile/constants';

export default function WikiFeedCard({ item, router, handleVote, styles }) {
  const authorName =
    item.profiles?.username ||
    `${item.profiles?.first_name || ''} ${item.profiles?.last_name || ''}`.trim() ||
    'Anonymous';

  const isQuestion = item.type === 'Question';

  const getAvatarSource = (avatarName) => {
    if (!avatarName || avatarName === 'null') return null;
    const matched = availableAvatars.find(a => a.name === avatarName);
    return matched ? matched.source : null;
  };

  const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, { 
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/Wiki/SubmissionDetail',
          params: { id: item.id },
        })
      }
    >
      {/* Header: Avatar, Name, Date */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.authorAvatar}>
          {getAvatarSource(item.profiles?.profile_avatar_url) ? (
            <Image 
              source={getAvatarSource(item.profiles.profile_avatar_url)} 
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB' }} 
            />
          ) : (
            <Ionicons name="person-circle" size={36} color="#D1D5DB" />
          )}
        </View>
        <View style={styles.headerAuthorInfo}>
          <Text style={styles.headerAuthorName}>{authorName}</Text>
          <Text style={styles.headerAuthorDate}>{formattedDate}</Text>
        </View>
      </View>

      {/* Content: Term/Question */}
      <View style={styles.termContainer}>
        {isQuestion && (
          <Ionicons name="help-circle" size={18} color="#7C3AED" style={{marginRight: 6}} />
        )}
        <Text style={styles.sourceTerm} numberOfLines={2}>
          {item.source_term}
        </Text>
      </View>

      {/* Flags/Tags */}
      <View style={styles.tagsRow}>
        <View style={[styles.regionBadge, item.status === 'verified' && styles.verifiedBadge]}>
          <Text style={[styles.regionBadgeText, item.status === 'verified' && styles.verifiedBadgeText]}>
            {item.status === 'verified' ? '✓ Verified' : item.region}
          </Text>
        </View>

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

      {/* Footer: Engagement Icons */}
      <View style={styles.cardFooter}>
        <View style={styles.engagementBtn}>
          <Text style={styles.engagementEmoji}>👍</Text>
          <Text style={styles.engagementText}>{item.upvotes || 0}</Text>
        </View>
        
        <View style={styles.engagementBtn}>
          <Ionicons name="chatbubble-outline" size={16} color="#9CA3AF" />
          <Text style={styles.engagementText}>{item.comments_count || 0}</Text>
        </View>
        
        <View style={styles.engagementBtn}>
          <Ionicons name="eye-outline" size={18} color="#9CA3AF" />
          <Text style={styles.engagementText}>{item.views || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
