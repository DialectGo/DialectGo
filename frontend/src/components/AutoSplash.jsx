import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, View } from 'react-native';
import beeImg from '../../assets/logo/bee.png';
import dialectTextImg from '../../assets/logo/dialectgo_text.png';
import { styles } from '../shared/theme/SplashStyles'; 

const { width, height } = Dimensions.get('window');

export default function AutoSplash({ onFinish }) {
  const beePos = useRef(new Animated.ValueXY({ x: 0, y: -height / 1.2 })).current; 
  const beeScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current; 
  const textScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const smoothFlight = (toX, toY, duration) => {
      return Animated.timing(beePos, {
        toValue: { x: toX, y: toY },
        duration: duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });
    };

    // Start Animation
    Animated.sequence([
      Animated.delay(500),
      smoothFlight(width * 0.3, -height * 0.1, 1000), 
      smoothFlight(-width * 0.35, height * 0.15, 1000), 
      // Landing Position
      Animated.timing(beePos, {
        toValue: { x: -140, y: 0 }, 
        duration: 1000,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(textScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();

    // Auto-navigate after 4.5 seconds (total animation time)
    const timer = setTimeout(() => {
      onFinish();
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.beeContainer, { transform: [{ translateX: beePos.x }, { translateY: beePos.y }, { scale: beeScale }] }]}>
            <Image source={beeImg} style={styles.bee} resizeMode="contain" />
          </Animated.View>
          <Animated.View style={{ opacity: textOpacity, transform: [{ scale: textScale }] }}>
            <Image source={dialectTextImg} style={styles.logoText} resizeMode="contain" />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}