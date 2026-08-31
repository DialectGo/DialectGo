import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  ScrollView, ActivityIndicator, LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import BreakdownPanel from './BreakdownPanel';
import LoadingModal from '../../../shared/components/LoadingModal';

import { TRANSLATION_API_BASE } from '../../../shared/api/client';
import { supabase } from '../../../shared/api/supabase';

// ─── Segment Explanation Bottom Sheet ───────────────────────────────────────

function SegmentExplanationSheet({ visible, segment, explanation, isLoading, onClose }) {
  if (!visible) return null;

  return (
    <View style={styles.explanationSheet}>
      <View style={styles.explanationHeader}>
        <View style={styles.explanationHandle} />
        <TouchableOpacity onPress={onClose} style={styles.explanationCloseBtn}>
          <Ionicons name="close-circle" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.explanationLabel}>📖 Tap-to-Explain</Text>
      <View style={styles.highlightedSegment}>
        <Text style={styles.highlightedSegmentText}>"{segment}"</Text>
      </View>

      {isLoading ? (
        <View style={styles.explanationLoading}>
          <ActivityIndicator size="small" color="#FBBF24" />
          <Text style={styles.explanationLoadingText}>Analyzing this segment...</Text>
        </View>
      ) : explanation ? (
        <ScrollView style={styles.explanationScroll} showsVerticalScrollIndicator={false}>
          {/* Main explanation */}
          <Text style={styles.explanationText}>{explanation.explanation}</Text>

          {/* Key terms */}
          {explanation.keyTerms?.length > 0 && (
            <View style={styles.keyTermsSection}>
              <Text style={styles.keyTermsTitle}>🔑 Key Terms</Text>
              {explanation.keyTerms.map((term, i) => (
                <View key={i} style={styles.keyTermCard}>
                  <Text style={styles.keyTermWord}>{term.term}</Text>
                  <Text style={styles.keyTermMeaning}>{term.meaning}</Text>
                  {term.rootWord && (
                    <Text style={styles.keyTermRoot}>Root: {term.rootWord}</Text>
                  )}
                  {term.regionalNote && (
                    <Text style={styles.keyTermRegional}>🗺️ {term.regionalNote}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Grammar notes */}
          {explanation.grammarNotes && (
            <View style={styles.grammarBox}>
              <Text style={styles.grammarTitle}>📝 Grammar</Text>
              <Text style={styles.grammarText}>{explanation.grammarNotes}</Text>
            </View>
          )}

          {/* Cultural context */}
          {explanation.culturalContext && (
            <View style={styles.culturalBox}>
              <Ionicons name="bulb-outline" size={14} color="#F59E0B" />
              <Text style={styles.culturalText}>{explanation.culturalContext}</Text>
            </View>
          )}

          {/* Simplified version */}
          {explanation.simplifiedVersion && (
            <View style={styles.simplifiedBox}>
              <Text style={styles.simplifiedLabel}>💬 Simpler way to say it:</Text>
              <Text style={styles.simplifiedText}>"{explanation.simplifiedVersion}"</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <Text style={styles.explanationError}>Tap a translated paragraph above to see its explanation.</Text>
      )}
    </View>
  );
}

// ─── Document Type Badge ────────────────────────────────────────────────────

function DocumentTypeBadge({ documentType }) {
  if (!documentType || !documentType.success) return null;

  return (
    <View style={styles.docTypeBadge}>
      <Text style={styles.docTypeLabel}>{documentType.displayLabel || '📄 Document'}</Text>
      {documentType.summary ? (
        <Text style={styles.docTypeSummary}>{documentType.summary}</Text>
      ) : null}
      {documentType.toneGuidance?.formality && (
        <View style={styles.toneTag}>
          <Text style={styles.toneTagText}>{documentType.toneGuidance.formality}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Tappable Translated Segments ───────────────────────────────────────────

function TranslatedSegments({ segments, translatedText, onSegmentTap }) {
  // If we have structured segments, render them as tappable paragraphs
  if (segments && segments.length > 0) {
    return (
      <View>
        {segments.map((seg, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.segmentBlock,
              seg.isHeader && styles.segmentHeaderBlock,
            ]}
            onPress={() => onSegmentTap(seg.translatedText || seg.text)}
            activeOpacity={0.6}
          >
            {seg.isHeader ? (
              <Text style={styles.segmentHeaderText}>{seg.translatedText || seg.text}</Text>
            ) : (
              <Text style={styles.segmentText}>{seg.translatedText || seg.text}</Text>
            )}
            <View style={styles.tapHint}>
              <Ionicons name="chatbubble-ellipses-outline" size={12} color="#D1D5DB" />
            </View>
          </TouchableOpacity>
        ))}
        <Text style={styles.tapInstruction}>
          <Ionicons name="hand-left-outline" size={11} color="#9CA3AF" /> Tap any paragraph to explain
        </Text>
      </View>
    );
  }

  // Fallback: split translated text into paragraphs
  if (translatedText) {
    const paragraphs = translatedText.split('\n').filter(p => p.trim());
    return (
      <View>
        {paragraphs.map((para, i) => (
          <TouchableOpacity
            key={i}
            style={styles.segmentBlock}
            onPress={() => onSegmentTap(para)}
            activeOpacity={0.6}
          >
            <Text style={styles.segmentText}>{para}</Text>
            <View style={styles.tapHint}>
              <Ionicons name="chatbubble-ellipses-outline" size={12} color="#D1D5DB" />
            </View>
          </TouchableOpacity>
        ))}
        <Text style={styles.tapInstruction}>
          <Ionicons name="hand-left-outline" size={11} color="#9CA3AF" /> Tap any paragraph to explain
        </Text>
      </View>
    );
  }

  return null;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TranslationResultModal({ visible, onClose, isLoading, result, error }) {
  const [showSource, setShowSource] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [segmentExplanation, setSegmentExplanation] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSegmentTap = async (segmentText) => {
    if (!segmentText?.trim()) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedSegment(segmentText);
    setShowExplanation(true);
    setIsExplaining(true);
    setSegmentExplanation(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${TRANSLATION_API_BASE}/translate/explain-segment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          segment: segmentText,
          fullSourceText: result?.sourceText || '',
          fullTranslatedText: result?.translatedText || '',
          sourceLang: 'English',
          targetLang: 'Cebuano',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSegmentExplanation(data);
      }
    } catch (err) {
      console.error('[TranslationResult] Explain segment error:', err.message);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result?.translatedText) return;
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              h1 { color: #1F2937; }
              p { font-size: 14px; color: #4B5563; line-height: 1.6; }
              .badge { background: #FEF3C7; padding: 4px 12px; border-radius: 8px; display: inline-block; margin-bottom: 12px; }
            </style>
          </head>
          <body>
            <h1>DialectGo Translation</h1>
            ${result.documentType?.displayLabel ? `<div class="badge">${result.documentType.displayLabel}</div>` : ''}
            <p>${result.translatedText.replace(/\n/g, '<br/>')}</p>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (err) {
      console.error('PDF Download Error:', err);
    }
  };

  const handleDownloadTxt = async () => {
    if (!result?.translatedText) return;
    try {
      const fileUri = FileSystem.cacheDirectory + 'translation.txt';
      await FileSystem.writeAsStringAsync(fileUri, result.translatedText);
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.error('TXT Download Error:', err);
    }
  };

  const handleClose = () => {
    setShowExplanation(false);
    setSelectedSegment(null);
    setSegmentExplanation(null);
    setShowBreakdown(false);
    setShowSource(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Translation Result</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F59E0B" />
              <Text style={styles.loadingText}>Processing document...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>Failed to translate document.</Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                {/* Document Type Badge */}
                <DocumentTypeBadge documentType={result?.documentType} />

                {/* Collapsible Original Source Text */}
                {result?.formattedSourceText && (
                  <TouchableOpacity
                    style={styles.sourceToggle}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setShowSource(!showSource);
                    }}
                  >
                    <Ionicons name="document-text-outline" size={16} color="#6B7280" />
                    <Text style={styles.sourceToggleText}>
                      {showSource ? 'Hide Original' : 'Show Original Text'}
                    </Text>
                    <Ionicons name={showSource ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
                {showSource && result?.formattedSourceText && (
                  <View style={styles.sourceBox}>
                    <Text style={styles.sourceText}>{result.formattedSourceText}</Text>
                  </View>
                )}

                {/* Translated Text — Tappable Segments */}
                <View style={styles.translatedSection}>
                  <Text style={styles.sectionLabel}>🌐 Translation</Text>
                  <TranslatedSegments
                    segments={result?.segments}
                    translatedText={result?.translatedText}
                    onSegmentTap={handleSegmentTap}
                  />
                </View>

                {/* AI Breakdown Toggle */}
                {result?.breakdown && (
                  <TouchableOpacity
                    style={styles.reviewBreakdownBtn}
                    onPress={() => setShowBreakdown(true)}
                  >
                    <Ionicons name="bulb" size={20} color="#F59E0B" />
                    <Text style={styles.reviewBreakdownText}>Review AI Breakdown</Text>
                  </TouchableOpacity>
                )}

                {/* BREAKDOWN PANEL MODAL */}
                {result?.breakdown && (
                  <BreakdownPanel 
                    visible={showBreakdown} 
                    onClose={() => setShowBreakdown(false)} 
                    breakdown={result.breakdown} 
                  />
                )}
              </ScrollView>

              {/* Segment Explanation Sheet (overlays bottom) */}
              <SegmentExplanationSheet
                visible={showExplanation}
                segment={selectedSegment}
                explanation={segmentExplanation}
                isLoading={isExplaining}
                onClose={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setShowExplanation(false);
                }}
              />

              {/* Footer Actions */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPdf}>
                  <Ionicons name="document-text" size={20} color="#FFF" />
                  <Text style={styles.downloadButtonText}>Save PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.downloadButton, styles.txtButton]} onPress={handleDownloadTxt}>
                  <Ionicons name="document" size={20} color="#1F2937" />
                  <Text style={[styles.downloadButtonText, { color: '#1F2937' }]}>Save TXT</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F9FAFB',
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollArea: {
    flex: 1,
  },

  // Document Type Badge
  docTypeBadge: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  docTypeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
  },
  docTypeSummary: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 4,
    lineHeight: 18,
  },
  toneTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  toneTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
    textTransform: 'capitalize',
  },

  // Source toggle
  sourceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 4,
  },
  sourceToggleText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  sourceBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sourceText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },

  // Translated section
  translatedSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },

  // Segment blocks
  segmentBlock: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  segmentHeaderBlock: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  segmentText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    flex: 1,
  },
  segmentHeaderText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  tapHint: {
    marginLeft: 6,
    marginTop: 4,
    opacity: 0.5,
  },
  tapInstruction: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 4,
  },

  // Breakdown toggle
  breakdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFDF7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 8,
  },
  breakdownToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B45309',
    flex: 1,
  },

  // Segment explanation sheet
  explanationSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '50%',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  explanationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  explanationHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
  },
  explanationCloseBtn: {
    padding: 4,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  highlightedSegment: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FBBF24',
  },
  highlightedSegmentText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#92400E',
    lineHeight: 20,
  },
  explanationScroll: {
    maxHeight: 200,
  },
  explanationText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 10,
  },
  explanationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  explanationLoadingText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  explanationError: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    padding: 16,
  },

  // Key terms
  keyTermsSection: {
    marginBottom: 10,
  },
  keyTermsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  keyTermCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  keyTermWord: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  keyTermMeaning: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  keyTermRoot: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  keyTermRegional: {
    fontSize: 11,
    color: '#7C3AED',
    marginTop: 2,
  },

  // Grammar box
  grammarBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  grammarTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338CA',
    marginBottom: 4,
  },
  grammarText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },

  // Cultural context
  culturalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  culturalText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },

  // Simplified version
  simplifiedBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  simplifiedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  simplifiedText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#15803D',
  },

  // Loading / Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#D97706',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  txtButton: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  downloadButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  reviewBreakdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
  },
  reviewBreakdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B45309',
  }
});
