import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Renders the original image with translated text overlaid at each OCR
 * bounding-box position, matching the Google Translate image translation style.
 *
 * Props:
 *  - imageUri: string (local file URI of the original image)
 *  - segments: Array<{ translatedText, sourceText, ... }> (per-segment translations)
 *  - ocrDetails: Array<{ text, box, confidence }> (raw PaddleOCR bounding-box data)
 *  - onSegmentTap: (text: string) => void
 */
export default function ImageOverlayResult({ imageUri, segments, ocrDetails, onSegmentTap }) {
  const [imageLayout, setImageLayout] = useState(null); // { width, height, naturalW, naturalH }
  const [showOriginal, setShowOriginal] = useState(false);

  const handleImageLoad = useCallback((event) => {
    const { width: naturalW, height: naturalH } = event.nativeEvent.source;
    // Display width is constrained to container; calculate displayed height proportionally
    const displayW = SCREEN_WIDTH - 32; // 16px padding each side
    const displayH = (naturalH / naturalW) * displayW;
    setImageLayout({ displayW, displayH, naturalW, naturalH });
  }, []);

  // Build a lookup from source text → translated text using segments
  const buildTranslationMap = () => {
    if (!segments || segments.length === 0) return {};
    const map = {};
    segments.forEach((seg) => {
      if (seg.sourceText) {
        map[seg.sourceText.trim().toLowerCase()] = seg.translatedText || seg.text || '';
      }
    });
    return map;
  };

  const translationMap = buildTranslationMap();

  /**
   * Scale a single PaddleOCR bounding box from natural image coords
   * to displayed image coords.
   * box format: [[x0,y0],[x1,y1],[x2,y2],[x3,y3]] (quad corners)
   */
  const scaleBox = (box) => {
    if (!imageLayout || !box || box.length < 4) return null;
    const { displayW, displayH, naturalW, naturalH } = imageLayout;
    const scaleX = displayW / naturalW;
    const scaleY = displayH / naturalH;
    const xs = box.map(p => p[0] * scaleX);
    const ys = box.map(p => p[1] * scaleY);
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    const right = Math.max(...xs);
    const bottom = Math.max(...ys);
    return { left, top, width: right - left, height: bottom - top };
  };

  const getTranslatedText = (sourceText) => {
    if (!sourceText) return null;
    const key = sourceText.trim().toLowerCase();
    // Exact match first
    if (translationMap[key]) return translationMap[key];
    // Fallback: check if any segment contains this text
    if (segments) {
      const match = segments.find(s =>
        s.sourceText?.toLowerCase().includes(key) ||
        key.includes(s.sourceText?.toLowerCase())
      );
      if (match) return match.translatedText || match.text;
    }
    return sourceText; // fallback: show original
  };

  return (
    <View style={styles.container}>
      {/* Toggle original/translated */}
      <TouchableOpacity
        style={styles.toggleBar}
        onPress={() => setShowOriginal(v => !v)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={showOriginal ? 'eye-off-outline' : 'eye-outline'}
          size={16}
          color="#6B7280"
        />
        <Text style={styles.toggleText}>
          {showOriginal ? 'Show Translation' : 'Show Original'}
        </Text>
        <Ionicons
          name={showOriginal ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#6B7280"
        />
      </TouchableOpacity>

      {/* Image container with overlay */}
      <ScrollView
        style={styles.imageScroll}
        contentContainerStyle={styles.imageScrollContent}
        maximumZoomScale={3}
        minimumZoomScale={1}
        scrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.imageWrapper,
            imageLayout ? { width: imageLayout.displayW, height: imageLayout.displayH } : {},
          ]}
        >
          {/* Original image (always underneath) */}
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.image,
              imageLayout ? { width: imageLayout.displayW, height: imageLayout.displayH } : {},
            ]}
            resizeMode="contain"
            onLoad={handleImageLoad}
          />

          {/* Translation overlays — hidden when showing original */}
          {!showOriginal && imageLayout && ocrDetails && ocrDetails.map((detail, i) => {
            const scaled = scaleBox(detail.box);
            if (!scaled) return null;
            const translated = getTranslatedText(detail.text);
            if (!translated) return null;

            return (
              <TouchableOpacity
                key={i}
                onPress={() => onSegmentTap && onSegmentTap(translated)}
                activeOpacity={0.75}
                style={[
                  styles.overlayBlock,
                  {
                    left: scaled.left,
                    top: scaled.top,
                    minWidth: scaled.width,
                    minHeight: scaled.height,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.overlayText,
                    { fontSize: Math.max(9, Math.min(scaled.height * 0.7, 14)) },
                  ]}
                  numberOfLines={3}
                  adjustsFontSizeToFit
                >
                  {translated}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {imageLayout && !showOriginal && (
        <View style={styles.tapHintRow}>
          <Ionicons name="hand-left-outline" size={12} color="#9CA3AF" />
          <Text style={styles.tapHintText}> Tap any text to explain</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  imageScroll: {
    flex: 1,
  },
  imageScrollContent: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    borderRadius: 8,
  },
  overlayBlock: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 244, 194, 0.92)', // yellow-tinted translucent
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'center',
  },
  tapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  tapHintText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
