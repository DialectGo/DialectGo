import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, Text, TouchableOpacity, View } from 'react-native';

// Corrected Paths based on your folder structure
import beeImg from '../../assets/logo/bee.png';
import dialectTextImg from '../../assets/logo/dialectgo_text.png';
import { styles } from '../styles/SplashStyles'; 

const { width, height } = Dimensions.get('window');

export default function IntroSplash({ onFinish }) {
  // Animation References
  const beePos = useRef(new Animated.ValueXY({ x: 0, y: -height / 1.2 })).current; 
  const beeScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current; 
  const textScale = useRef(new Animated.Value(0.8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const smoothFlight = (toX, toY, duration) => {
      return Animated.timing(beePos, {
        toValue: { x: toX, y: toY },
        duration: duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });
    };

    // Main Animation Sequence
    Animated.sequence([
      Animated.delay(500),
      smoothFlight(width * 0.3, -height * 0.1, 1500), 
      smoothFlight(-width * 0.35, height * 0.15, 1800), 
      smoothFlight(width * 0.35, height * 0.25, 1800),  
      smoothFlight(-width * 0.2, -height * 0.05, 1500), 

      // Landing Position
      Animated.timing(beePos, {
        toValue: { x: -140, y: 0 }, 
        duration: 1500,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),

      // UI Text Entrance
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.spring(textScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),

      // Button Entrance
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(buttonY, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    ]).start();

    // Constant Bee Hover Effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(beeScale, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(beeScale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.logoWrapper}>
          
          {/* Animated Bee */}
          <Animated.View
            style={[
              styles.beeContainer,
              {
                transform: [
                  { translateX: beePos.x },
                  { translateY: beePos.y },
                  { scale: beeScale },
                ],
              },
            ]}
          >
            <Image 
              source={beeImg} 
              style={styles.bee} 
              resizeMode="contain" 
            />
          </Animated.View>

          {/* Animated Text Logo */}
          <Animated.View 
            style={{ 
              opacity: textOpacity,
              transform: [{ scale: textScale }]
            }}
          >
            <Image 
              source={dialectTextImg} 
              style={styles.logoText} 
              resizeMode="contain" 
            />
          </Animated.View>
        </View>

        {/* Action Button */}
        <Animated.View 
          style={[
            styles.buttonWrapper, 
            { 
              opacity: buttonOpacity,
              transform: [{ translateY: buttonY }] 
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.8}
            onPress={onFinish} // This tells the app to move to Onboarding
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}