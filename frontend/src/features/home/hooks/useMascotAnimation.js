import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Provides a continuous looping floating animation (up and down).
 * Useful for the Bee mascot or any floating UI element.
 * 
 * @param {number} distance - The negative Y translation distance (default: -8)
 * @param {number} duration - The duration of each animation cycle in ms (default: 1200)
 * @returns {Animated.Value} The Animated.Value instance to attach to a transform array
 */
export const useMascotAnimation = (distance = -8, duration = 1200) => {
  const mascotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotAnim, { 
          toValue: distance, 
          duration, 
          easing: Easing.inOut(Easing.sin), 
          useNativeDriver: true 
        }),
        Animated.timing(mascotAnim, { 
          toValue: 0, 
          duration, 
          easing: Easing.inOut(Easing.sin), 
          useNativeDriver: true 
        }),
      ])
    ).start();
  }, [mascotAnim, distance, duration]);

  return mascotAnim;
};
