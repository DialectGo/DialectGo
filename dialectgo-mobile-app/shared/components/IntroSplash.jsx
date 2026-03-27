import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions, Image } from 'react-native';
import bubbleTextImg from '@assets/logo/BubbleText.png';
import dotImg from '@assets/logo/Dot.png';
import goProfileImg from '@assets/logo/GoProfile.png';

const { height } = Dimensions.get('window');

export default function IntroSplash({ onAnimationFinished }) {
  const bubbleScale = useRef(new Animated.Value(5)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;
  const goOpacity = useRef(new Animated.Value(0)).current;
  const goScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const runDotSequence = () => [
      Animated.timing(dot1Opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(dot2Opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(dot3Opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(dot1Opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(dot2Opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(dot3Opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ])
    ];

    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(bubbleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(bubbleScale, { toValue: 1, duration: 800, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      ]),
      ...runDotSequence(),
      ...runDotSequence(),
      Animated.parallel([
        Animated.timing(goOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(goScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]),
    ]).start(() => onAnimationFinished());
  }, []);

  return (
    <View style={styles.logoWrapper}>
      <Animated.Image 
        source={bubbleTextImg} 
        style={[styles.bubble, { opacity: bubbleOpacity, transform: [{ scale: bubbleScale }] }]} 
      />
      <Animated.View style={styles.dotsContainer}>
        <Animated.Image source={dotImg} style={[styles.dot, { opacity: dot1Opacity }]} />
        <Animated.Image source={dotImg} style={[styles.dot, { opacity: dot2Opacity }]} />
        <Animated.Image source={dotImg} style={[styles.dot, { opacity: dot3Opacity }]} />
      </Animated.View>
      <Animated.Image 
        source={goProfileImg} 
        style={[styles.goIcon, { opacity: goOpacity, transform: [{ scale: goScale }] }]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoWrapper: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center' },
  bubble: { width: 240, height: 220, resizeMode: 'contain', zIndex: 1 },
  dotsContainer: { position: 'absolute', flexDirection: 'row', bottom: '48%', zIndex: 2, transform: [{ rotate: '-10deg' }] },
  dot: { width: 22, height: 22, marginHorizontal: 3, resizeMode: 'contain' },
  goIcon: { position: 'absolute', width: 140, height: 140, top: -10, alignSelf: 'center', resizeMode: 'contain', zIndex: 3 },
});