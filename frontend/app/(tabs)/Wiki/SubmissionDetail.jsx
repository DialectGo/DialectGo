import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../shared/lib/supabase';
import TopBar from '../../../shared/components/TopBar';
import { WIKI_API_BASE } from '../../../shared/config/apiConfig';

export default function SubmissionDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null); // 1, -1, or null

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${WIKI_API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await response.json();

      if (json.success) {
        setSubmission(json.data);
        setUserVote(json.data.userVote || null);
      }
    } catch (err) {
      console.error('[SubmissionDetail] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
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
        // Toggle vote state
        setUserVote(prev => prev === voteType ? null : voteType);

        if (json.promoted) {
          Alert.alert('🎉 Verified!', 'This term has been added to the translation corpus!');
        }
      }
    } catch (err) {
      console.error('[SubmissionDetail] Vote error:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TopBar title="Dialect Wiki" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FBBF24" />
        </View>
      </View>
    );
  }

  if (!submission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TopBar title="Dialect Wiki" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Submission not found</Text>
        </View>
      </View>
    );
  }

  const authorName = submission.profiles?.username
    || `${submission.profiles?.first_name || ''} ${submission.profiles?.last_name || ''}`.trim()
    || 'Anonymous';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TopBar title="Dialect Wiki" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
          <Text style={styles.backText}>Back to Feed</Text>
        </TouchableOpacity>

        {/* Main card */}
        <View style={styles.mainCard}>
          {/* Status badge */}
          <View style={[styles.statusBadge, submission.status === 'verified' && styles.verifiedStatus]}>
            <Ionicons
              name={submission.status === 'verified' ? 'checkmark-circle' : 'time-outline'}
              size={16}
              color={submission.status === 'verified' ? '#059669' : '#D97706'}
            />
            <Text style={[styles.statusText, submission.status === 'verified' && styles.verifiedStatusText]}>
              {submission.status === 'verified' ? 'Community Verified' : 'Pending Review'}
            </Text>
          </View>

          {/* Source term */}
          <Text style={styles.sourceTerm}>{submission.source_term}</Text>

          {/* Region & Category */}
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

          {/* Translation */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>STANDARD TRANSLATION</Text>
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
            <Ionicons name="person-circle-outline" size={20} color="#9CA3AF" />
            <Text style={styles.authorText}>Submitted by @{authorName}</Text>
            <Text style={styles.dateText}>
              {new Date(submission.created_at).toLocaleDateString()}
            </Text>
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
              <Text style={[styles.voteBtnText, userVote === 1 && styles.activeVoteText]}>
                Upvote
              </Text>
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
              <Text style={[styles.voteBtnText, userVote === -1 && styles.activeVoteText]}>
                Downvote
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.voteHint}>10 upvotes = auto-verified into the corpus</Text>
        </View>
      </ScrollView>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  verifiedStatus: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  verifiedStatusText: {
    color: '#059669',
  },
  sourceTerm: {
    fontSize: 26,
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
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  authorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
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
});
