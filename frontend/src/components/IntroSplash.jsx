import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { styles } from '../shared/theme/SplashStyles';

const { width, height } = Dimensions.get('window');

// ======================================================
// BEE ANIMATION FRAMES
// ======================================================

const beeFrames = [
  require('../../assets/beelogo/1bee_front.png'),
  require('../../assets/beelogo/2bee_side.png'),
  require('../../assets/beelogo/3bee_left.png'),
  require('../../assets/beelogo/4bee_back.png'),
  require('../../assets/beelogo/5bee_right.png'),
  require('../../assets/beelogo/6bee_front.png'),
];

export default function IntroSplash({ onFinish }) {

  // ======================================================
  // BEE FRAME
  // ======================================================

  const [beeFrame, setBeeFrame] = useState(0);

  // ======================================================
  // ANIMATION REFERENCES
  // ======================================================

  const beePos = useRef(
    new Animated.ValueXY({
      x: 0,
      y: -height / 1.2,
    })
  ).current;

  const beeScale = useRef(
    new Animated.Value(1)
  ).current;

  const textOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const textScale = useRef(
    new Animated.Value(0.8)
  ).current;

  const buttonOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const buttonY = useRef(
    new Animated.Value(20)
  ).current;


  // ======================================================
  // BEE FRAME LOOP
  // ======================================================

  useEffect(() => {

    const frameInterval = setInterval(() => {

      setBeeFrame(prev => {

        if (prev >= beeFrames.length - 1) {
          return 0;
        }

        return prev + 1;
      });

    }, 180);

    return () => clearInterval(frameInterval);

  }, []);


  // ======================================================
  // MAIN SPLASH ANIMATION
  // ======================================================

  useEffect(() => {

    const smoothFlight = (toX, toY, duration) => {

      return Animated.timing(beePos, {
        toValue: {
          x: toX,
          y: toY,
        },
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });

    };


    // ====================================================
    // BEE FLIGHT
    // ====================================================

    Animated.sequence([

      // Start from top
      Animated.delay(500),

      // Fly down-right
      smoothFlight(
        width * 0.3,
        -height * 0.1,
        1500
      ),

      // Fly down-left
      smoothFlight(
        -width * 0.35,
        height * 0.15,
        1800
      ),

      // Fly down-right
      smoothFlight(
        width * 0.35,
        height * 0.25,
        1800
      ),

      // Fly back up-left
      smoothFlight(
        -width * 0.2,
        -height * 0.05,
        1500
      ),

      // ==================================================
      // LANDING POSITION
      // ==================================================

      Animated.timing(beePos, {
        toValue: {
          x: -140,
          y: 0,
        },
        duration: 1500,
        easing: Easing.out(
          Easing.back(1)
        ),
        useNativeDriver: true,
      }),

      // ==================================================
      // TEXT ENTRANCE
      // ==================================================

      Animated.parallel([

        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),

        Animated.spring(textScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),

      ]),

      // ==================================================
      // BUTTON ENTRANCE
      // ==================================================

      Animated.parallel([

        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),

        Animated.timing(buttonY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),

      ]),

    ]).start();


    // ====================================================
    // BEE HOVER EFFECT
    // ====================================================

    const hoverAnimation = Animated.loop(

      Animated.sequence([

        Animated.timing(beeScale, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(beeScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

      ])

    );

    hoverAnimation.start();


    // ====================================================
    // CLEANUP
    // ====================================================

    return () => {
      hoverAnimation.stop();
    };

  }, []);


  // ======================================================
  // RENDER
  // ======================================================

  return (

    <View style={styles.container}>

      <View style={styles.contentWrapper}>

        <View style={styles.logoWrapper}>

          {/* ==================================================
              ANIMATED BEE
          ================================================== */}

          <Animated.View
            style={[
              styles.beeContainer,
              {
                transform: [
                  {
                    translateX: beePos.x,
                  },
                  {
                    translateY: beePos.y,
                  },
                  {
                    scale: beeScale,
                  },
                ],
              },
            ]}
          >

            <Image
              source={beeFrames[beeFrame]}
              style={styles.bee}
              resizeMode="contain"
            />

          </Animated.View>


          {/* ==================================================
              DIALECTGO TEXT LOGO
          ================================================== */}

          <Animated.View
            style={{
              opacity: textOpacity,
              transform: [
                {
                  scale: textScale,
                },
              ],
            }}
          >

            <Image
              source={require(
                '../../assets/logo/dialectgo_text.png'
              )}
              style={styles.logoText}
              resizeMode="contain"
            />

          </Animated.View>

        </View>


        {/* ==================================================
            GET STARTED BUTTON
        ================================================== */}

        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              opacity: buttonOpacity,
              transform: [
                {
                  translateY: buttonY,
                },
              ],
            },
          ]}
        >

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={onFinish}
          >

            <Text style={styles.buttonText}>
              Get Started
            </Text>

          </TouchableOpacity>

        </Animated.View>

      </View>

    </View>

  );
}