import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');
const JEEP_WIDTH = 120; // Estimated width of the jeep image

export default function AnimatedJeep() {
  const translateX = useRef(new Animated.Value(width)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Driving animation from right to left across the screen
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -JEEP_WIDTH, // Drive completely off the left side of the screen
        duration: 5000,       // Adjust for speed
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Shaking/bouncing animation to simulate driving over bumps
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -3, // Move slightly up
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0, // Move back down
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateX, translateY]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../../../assets/on-boarding-animation/dialectgo_jeep_image.png')}
        style={[
          styles.jeep,
          {
            transform: [
              { translateX },
              { translateY },
            ],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60, // Fixed height area for the jeep to drive across
    width: '100%',
    position: 'absolute', // Absolute positioning so it can hover over the card slightly
    bottom: 0, // Positioned at the bottom of the white area
    zIndex: 10, // Ensure it stays on top of the card
  },
  jeep: {
    width: JEEP_WIDTH,
    height: '100%',
  },
});
