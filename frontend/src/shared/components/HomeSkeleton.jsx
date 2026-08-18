import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

/**
 * A highly reusable Skeleton Loader component.
 * Produces a pulsing gray block to signify data loading states,
 * replacing standard ActivityIndicators.
 * 
 * @param {number|string} width - Width of the skeleton
 * @param {number|string} height - Height of the skeleton
 * @param {number} borderRadius - Corner radius
 * @param {object} style - Additional style overrides
 */
export default function HomeSkeleton({ width = '100%', height = 20, borderRadius = 8, style }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB', // Tailwind gray-200
    overflow: 'hidden',
  },
});
