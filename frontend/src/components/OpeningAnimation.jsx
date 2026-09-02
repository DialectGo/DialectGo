import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ============================================================
// ASSETS
// ============================================================

const JEEP_IMG  = require('../../assets/on-boarding-animation/dialectgo_jeep_image.png');
const BEE_IMG   = require('../../assets/on-boarding-animation/dialectgo_bee_mascot_image.png');
const TEXT_IMG  = require('../../assets/on-boarding-animation/dialectgo_text.png');
const BUBBLE_L  = require('../../assets/on-boarding-animation/left_chat_bubble_image.png');
const BUBBLE_R  = require('../../assets/on-boarding-animation/right_chat_bubble_image.png');
const GLITTER_1 = require('../../assets/on-boarding-animation/yellow_sprinkle light_image_1.png');
const GLITTER_2 = require('../../assets/on-boarding-animation/yellow_sprinkle light_image_2.png');

// ============================================================
// CONSTANTS
// ============================================================

const { width, height } = Dimensions.get('window');

const JEEP_W    = width * 0.85;
const JEEP_H    = JEEP_W * (700 / 1500);   // approx. aspect ratio

// Increased bee size
const BEE_SIZE  = 95;

// Slightly smaller bubbles so they don't overwhelm the jeep
const BUBBLE_W  = 75;
const BUBBLE_H  = 65;

// Bigger DialectGo text
const TEXT_W    = width * 0.62;
const TEXT_H    = TEXT_W * 0.38;

// Derived jeep position constants (used in JSX and useEffect)
const JEEP_CENTER_X = (width - JEEP_W) / 2;
const JEEP_TOP_Y    = height / 2 - JEEP_H / 2;

// Logo row: bee + text sit right next to each other, combo centered horizontally
const LOGO_GAP    = 0;   // no gap — bee and text touch
const BEE_FINAL_X = (width - BEE_SIZE - LOGO_GAP - (width * 0.62)) / 2;
const BEE_FINAL_Y = height / 2 - BEE_SIZE / 2;
// Trail images used in trailDots (computed inside component)

// ============================================================
// TRAIL DOT
// A fixed-position dot placed along the bee's flight path.
// It appears when triggered (bee flies over it) then slowly fades.
// This creates the long, visible dotted-trail effect shown in the design.
// ============================================================

function TrailDot({ x, y, size, delay, triggerAnim, image }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!triggerAnim) return;
    Animated.sequence([
      // Wait until bee reaches this dot's position
      Animated.delay(delay),
      // Pop in
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0.95, duration: 220, useNativeDriver: true }),
        Animated.spring(scale,   { toValue: 1,    friction: 5,   useNativeDriver: true }),
      ]),
      // Slowly fade out so the trail is visible for a long time
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [triggerAnim]);

  return (
    <Animated.Image
      source={image}
      style={{
        position: 'absolute',
        left:   x,
        top:    y,
        width:  size,
        height: size,
        opacity,
        transform: [{ scale }],
      }}
      resizeMode="contain"
    />
  );
}

// ============================================================
// CHAT BUBBLE
// ============================================================

function ChatBubble({ image, text, isRight, visible }) {
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, { toValue: 0, friction: 6, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.bubbleWrapper,
        {
          opacity,
          // IMPORTANT: scaleX and scale MUST be in the same transform array.
          // Splitting across style objects causes the last one to silently override.
          transform: isRight
            ? [{ scale }]
            : [{ scaleX: -1 }, { scale }],
        },
      ]}
    >
      <Image source={image} style={styles.bubbleImage} resizeMode="contain" />
      <Text style={[styles.bubbleText, isRight ? null : styles.bubbleTextLeft]}>
        {text}
      </Text>
    </Animated.View>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function OpeningAnimation({ onFinish }) {

  // --- State ---
  const [rightBubbleVisible,   setRightBubbleVisible]   = useState(false);
  const [leftBubbleVisible,    setLeftBubbleVisible]    = useState(false);
  const [salamatBubbleVisible, setSalamatBubbleVisible] = useState(false);
  const [glitterTrigger,       setGlitterTrigger]       = useState(false);

  // --- Animated values ---
  const jeepX     = useRef(new Animated.Value(width + JEEP_W)).current;
  const jeepShake = useRef(new Animated.Value(0)).current;

  const beeX       = useRef(new Animated.Value(0)).current;
  const beeY       = useRef(new Animated.Value(0)).current;
  const beeOpacity = useRef(new Animated.Value(0)).current;
  const beeScale   = useRef(new Animated.Value(0.3)).current;
  const beeHoverY  = useRef(new Animated.Value(0)).current;

  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale   = useRef(new Animated.Value(0.85)).current;

  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnY       = useRef(new Animated.Value(30)).current;

  const hoverRef = useRef(null);

  // Bee spawn: exit from jeep rear door, raised to door level.
  const beeStartX = JEEP_CENTER_X + JEEP_W * 0.80;
  const beeStartY = JEEP_TOP_Y + JEEP_H * 0.18;

  // ── TRAIL DOTS ───────────────────────────────────────────────────────────────
  // 24 fixed-position dots placed along the bee's actual flight path (right → left).
  // Each appears with a staggered delay matching when the bee passes that position.
  // They are NOT attached to the bee — they stay where they are and slowly fade.
  // This produces the long horizontal dotted trail visible in the design reference.
  const N_TRAIL     = 24;
  const trailStartX = beeStartX + 18;                // bee X after exiting jeep door
  const trailEndX   = BEE_FINAL_X + BEE_SIZE * 0.35; // approx bee center at rest
  const trailStartY = beeStartY   + BEE_SIZE * 0.52; // bee tail Y at start
  const trailEndY   = BEE_FINAL_Y + BEE_SIZE * 0.52; // bee tail Y at rest
  const trailDots   = Array.from({ length: N_TRAIL }, (_, i) => {
    const t = i / (N_TRAIL - 1);
    return {
      x:     trailStartX - t * (trailStartX - trailEndX), // right → left
      y:     trailStartY + t * (trailEndY - trailStartY) + Math.sin(i * 1.1) * 5,
      size:  20 - t * 8,     // 20px near start, 12px at end
      delay: i * 72,         // 0ms to ~1700ms (matches 1800ms bee flight)
      image: i % 2 === 0 ? GLITTER_1 : GLITTER_2,
    };
  });

  // Bubble positions: track jeep X so they always hover above the roof.
  const bubbleY = JEEP_TOP_Y - BUBBLE_H + 18;

  // Bubbles shifted further right — now sit squarely over the jeep body.
  // Left  = "sa tabi lang noy!" above driver window (~36% from jeep left)
  const leftBubbleOffsetX  = JEEP_W * 0.36;
  // Right = "para po!" above PASSENGER / PARA! area (~64% from jeep left)
  const rightBubbleOffsetX = JEEP_W * 0.64;

  const startHover = () => {
    hoverRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(beeHoverY, { toValue: -6, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(beeHoverY, { toValue:  0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    hoverRef.current.start();
  };

  useEffect(() => {
    beeX.setValue(beeStartX);
    beeY.setValue(beeStartY);

    // ── PHASE 1: Jeep shakes & enters ──────────────────────────
    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(jeepShake, { toValue:  3, duration: 75, useNativeDriver: true }),
        Animated.timing(jeepShake, { toValue: -3, duration: 75, useNativeDriver: true }),
        Animated.timing(jeepShake, { toValue:  2, duration: 75, useNativeDriver: true }),
        Animated.timing(jeepShake, { toValue: -2, duration: 75, useNativeDriver: true }),
      ])
    );
    shakeLoop.start();

    Animated.timing(jeepX, {
      toValue: JEEP_CENTER_X,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {

      // ── Stop shake ─────────────────────────────────────────────
      shakeLoop.stop();
      Animated.timing(jeepShake, { toValue: 0, duration: 60, useNativeDriver: true }).start();

      // ── PHASE 2: Right bubble "sa tabi lang noy!" ───────────────
      setTimeout(() => {
        setRightBubbleVisible(true);

        // ── PHASE 3: Left bubble "para po!" ─────────────────────────
        setTimeout(() => {
          setLeftBubbleVisible(true);

          // Dismiss both after ~2s
          setTimeout(() => {
            setRightBubbleVisible(false);
            setLeftBubbleVisible(false);

            // ── PHASE 4: Bee exits jeep door ─────────────────────────
            setTimeout(() => {
              Animated.parallel([
                Animated.timing(beeOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(beeScale,   { toValue: 1, friction: 5, tension: 55, useNativeDriver: true }),
                Animated.timing(beeX, {
                  toValue: beeStartX + 18,
                  duration: 650,
                  easing: Easing.out(Easing.back(1.5)),
                  useNativeDriver: true,
                }),
              ]).start(() => {

                // "salamat po!" bubble top-left of bee
                setSalamatBubbleVisible(true);

                setTimeout(() => {
                  setSalamatBubbleVisible(false);

                  // ── PHASE 5: Jeep exits left ────────────────────────
                  Animated.timing(jeepX, {
                    toValue: -(JEEP_W + 80),
                    duration: 1800,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                  }).start(() => {

                    // ── PHASE 6: Bee moves left with glitter trail ──────
                    setGlitterTrigger(true);

                    Animated.parallel([
                      Animated.timing(beeX, {
                        toValue: BEE_FINAL_X,
                        duration: 1800,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                      }),
                      Animated.timing(beeY, {
                        toValue: BEE_FINAL_Y,
                        duration: 1800,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                      }),
                    ]).start(() => {

                      // ── PHASE 7: Logo text fades in ─────────────────
                      startHover();

                      Animated.sequence([
                        Animated.delay(200),
                        Animated.parallel([
                          Animated.timing(textOpacity, {
                            toValue: 1,
                            duration: 950,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                          }),
                          Animated.spring(textScale, { toValue: 1, friction: 7, useNativeDriver: true }),
                        ]),
                      ]).start(() => {

                        // ── PHASE 8: Get Started button ─────────────
                        Animated.parallel([
                          Animated.timing(btnOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
                          Animated.timing(btnY, {
                            toValue: 0,
                            duration: 700,
                            easing: Easing.out(Easing.back(1.2)),
                            useNativeDriver: true,
                          }),
                        ]).start();
                      });
                    });
                  });
                }, 1800);
              });
            }, 300);
          }, 3200);

        }, 1400);
      }, 400);
    });

    return () => {
      shakeLoop.stop();
      if (hoverRef.current) hoverRef.current.stop();
    };
  }, []);

  // ── RENDER ─────────────────────────────────────────────────

  return (
    <View style={styles.screen}>

      {/* ── JEEP  (zIndex 10) ───────────────────────────────── */}
      <Animated.Image
        source={JEEP_IMG}
        style={[
          styles.jeep,
          {
            top: JEEP_TOP_Y,
            zIndex: 10,
            transform: [
              { translateX: jeepX },
              { translateY: jeepShake },
            ],
          },
        ]}
        resizeMode="contain"
      />

      {/* ── LEFT BUBBLE — "sa tabi lang noy!" above DRIVER area
              Tracks jeep X via Animated.add → always above roof.
              BUBBLE_L with isRight → natural orientation (tail bottom-left).
              zIndex 30 → in front of jeep.                        ── */}
      <Animated.View
        style={[
          styles.bubbleAnchor,
          {
            zIndex: 30,
            top: bubbleY,
            transform: [{
              translateX: Animated.add(
                jeepX,
                new Animated.Value(leftBubbleOffsetX)
              ),
            }],
          },
        ]}
        pointerEvents="none"
      >
        <ChatBubble
          image={BUBBLE_L}
          text="sa tabi lang noy!"
          isRight
          visible={leftBubbleVisible}
        />
      </Animated.View>

      {/* ── RIGHT BUBBLE — "para po!" above PASSENGER / PARA! area
              Tracks jeep X. BUBBLE_R natural orientation (tail bottom-right).
              zIndex 30.                                            ── */}
      <Animated.View
        style={[
          styles.bubbleAnchor,
          {
            zIndex: 30,
            top: bubbleY,
            transform: [{
              translateX: Animated.add(
                jeepX,
                new Animated.Value(rightBubbleOffsetX)
              ),
            }],
          },
        ]}
        pointerEvents="none"
      >
        <ChatBubble
          image={BUBBLE_R}
          text="para po!"
          isRight
          visible={rightBubbleVisible}
        />
      </Animated.View>

      {/* ── "SALAMAT PO!" BUBBLE
              Positioned to the upper-LEFT of the bee's head.
              Shifted left & down so it's near the face, not floating far right.
              zIndex 40 → in front of jeep.                        ── */}
      <Animated.View
        style={[
          styles.bubbleAnchor,
          {
            zIndex: 40,
            transform: [
              // Pull left so bubble is above-left of bee head
              { translateX: Animated.add(beeX, new Animated.Value(-BUBBLE_W * 0.55)) },
              // Lower — overlaps with jeep but stays in front (zIndex 40)
              { translateY: Animated.add(beeY, new Animated.Value(-BUBBLE_H + 28)) },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <ChatBubble
          image={BUBBLE_R}
          text="salamat po!"
          isRight
          visible={salamatBubbleVisible}
        />
      </Animated.View>

      {/* ── GLITTER TRAIL (24 fixed dots along bee's path) ─────────
              Each dot pops in as the bee flies over it and lingers,
              creating the long visible dotted trail from the design.  ── */}
      {trailDots.map((dot, i) => (
        <TrailDot
          key={`trail-${i}`}
          x={dot.x}
          y={dot.y}
          size={dot.size}
          delay={dot.delay}
          triggerAnim={glitterTrigger}
          image={dot.image}
        />
      ))}

      {/* ── BEE MASCOT  (zIndex 20) ─────────────────────────── */}
      <Animated.Image
        source={BEE_IMG}
        style={[
          styles.bee,
          {
            zIndex: 20,
            opacity: beeOpacity,
            transform: [
              { translateX: beeX },
              { translateY: Animated.add(beeY, beeHoverY) },
              { scale: beeScale },
            ],
          },
        ]}
        resizeMode="contain"
      />

      {/* ── DIALECTGO TEXT LOGO
              Sits directly to the right of the bee, centered together.  ── */}
      <Animated.Image
        source={TEXT_IMG}
        style={[
          styles.dialectText,
          {
            // Place text right next to bee (no gap)
            left: BEE_FINAL_X + BEE_SIZE + LOGO_GAP,
            // Vertically center text with bee
            top:  BEE_FINAL_Y + (BEE_SIZE - TEXT_H) / 2,
            opacity: textOpacity,
            transform: [{ scale: textScale }],
          },
        ]}
        resizeMode="contain"
      />

      {/* ── GET STARTED BUTTON ──────────────────────────────── */}
      <Animated.View
        style={[
          styles.btnWrapper,
          {
            opacity: btnOpacity,
            transform: [{ translateY: btnY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.82}
          onPress={onFinish}
        >
          <Text style={styles.btnText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#FFFEF7',
    overflow: 'hidden',
  },

  jeep: {
    position: 'absolute',
    width: JEEP_W,
    height: JEEP_H,
    left: 0,
  },

  bee: {
    position: 'absolute',
    width:  BEE_SIZE,
    height: BEE_SIZE,
    left: 0,
    top:  0,
  },

  dialectText: {
    position: 'absolute',
    width:  TEXT_W,
    height: TEXT_H,
  },

  bubbleAnchor: {
    position: 'absolute',
  },

  bubbleWrapper: {
    width:  BUBBLE_W,
    height: BUBBLE_H,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bubbleLeft: {
    transform: [{ scaleX: -1 }],
  },

  bubbleImage: {
    position: 'absolute',
    width:  '100%',
    height: '100%',
  },

  // Bigger text inside the smaller bubble
  bubbleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#421C00',
    textAlign: 'center',
    paddingHorizontal: 5,
    paddingBottom: 4,
    letterSpacing: -0.3,
    lineHeight: 13,
  },

  bubbleTextLeft: {
    transform: [{ scaleX: -1 }],
  },

  btnWrapper: {
    position: 'absolute',
    bottom: 72,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  btn: {
    backgroundColor: '#FFD54F',
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 32,
    shadowColor: '#8A6200',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },

  btnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#421C00',
    letterSpacing: 0.3,
  },

});
