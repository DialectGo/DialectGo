import { Dimensions, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({

  // Tarsi Header Styles
  tarsiHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5, // Reduced gap between greeting and banner
  },
  tarsiDate: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  tarsiGreeting: {
    fontSize: 26,
    color: '#374151',
    fontFamily: 'System', // Use default font but could be custom
  },

  // --- MAIN CONTAINER ---
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // o kahit anong background color ng app mo
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Para sa Android
  },
  
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 120, // Space para hindi matakpan ng Bottom Tab
    paddingTop: 0,
  },

  // --- TOP BAR (CLEAN VERSION) ---
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 15,
    backgroundColor: '#FFF',
  },
  miniLogoHeader: {
    width: 45,
    height: 45,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD54F',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  // --- AESTHETIC HEADER ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  headerTextGroup: {
    flex: 1,
  },
  helloText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: '#A0A0A0',
  },
  userName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#421C00',
    lineHeight: 38,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#4CAF50', // Green indicator
  },
  avatarWrapper: {
    position: 'relative',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarMain: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 3,
    borderColor: '#FFD54F',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#421C00',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  levelText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  // --- SECTION HEADER ---
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 26,
    color: '#421C00',
  },
  titleAccentYellow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD54F',
    marginLeft: 6,
    marginTop: 8, // Center alignment fix for Poppins
  },

  // --- JEEPNEY PROMO CARD ---
  promoCardWrapper: {
    marginTop: 35, // Binigyan ng space yung mga bees sa itaas
    marginBottom: 120, // Bottom Tab safe zone
    position: 'relative',
    overflow: 'visible', // REQUIRED: Para lumabas ang bees at jeep sa border
  },
  promoCard: {
    backgroundColor: '#421C00',
    borderRadius: 40,
    padding: 25,
    flexDirection: 'row',
    height: 175,
    elevation: 15,
    shadowColor: '#421C00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    zIndex: 5, // Baseline layer
  },
  promoTextContainer: {
    flex: 1.4,
    justifyContent: 'center',
  },
  promoLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#FFD54F',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  promoBrand: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    color: '#FFF',
    lineHeight: 40,
    marginBottom: 15,
  },
  exploreBtn: {
    backgroundColor: '#FFD54F',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    elevation: 4,
  },
  exploreBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: '#421C00',
    textTransform: 'uppercase',
  },

  // --- JEEPNEY (FIXED LAYER) ---
  jeepneyImageFixed: {
    width: 200,
    height: 140,
    position: 'absolute',
    right: -15,
    bottom: -15, // "Parked" effect sa baba ng card
    zIndex: 10, // Above card, below some bees
  },

  // --- LIVELY BEE SWARM (5 BEES) ---
  flyingBee: {
    position: 'absolute',
    zIndex: 20, // Topmost layer
  },
  // Bee 1: Top Left (Main Bee)
  bee1: {
    top: -25,
    left: 10,
    width: 45,
    height: 45,
    transform: [{ rotate: '-20deg' }],
  },
  // Bee 2: Center Right (Overlap sa Jeep)
  bee2: {
    top: 20,
    right: -25,
    width: 32,
    height: 32,
    transform: [{ rotate: '45deg' }],
  },
  // Bee 3: Bottom Left (Lower Card)
  bee3: {
    bottom: -20,
    left: 40,
    width: 38,
    height: 38,
    transform: [{ rotate: '15deg' }],
  },
  // Bee 4: Top Right (Malayo/Maliit)
  bee4: {
    top: -10,
    right: 60,
    width: 25,
    height: 25,
    opacity: 0.8,
    transform: [{ rotate: '-40deg' }],
  },
  // Bee 5: Bottom Right (Beside Jeep)
  bee5: {
    bottom: -25,
    right: 15,
    width: 42,
    height: 42,
    transform: [{ rotate: '-10deg' }],
  },



// ========================================
// Word of the Day Part
// ========================================

homeHero: {
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  minHeight: 200,
  marginTop: 0,
  marginBottom: 20,
},

// LEFT SIDE — BEE
heroBeeContainer: {
  width: '42%',
  height: 270,
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'visible',
},

heroBee: {
  width: 150,
  height: 220,
},

// RIGHT SIDE
heroContent: {
  width: '58%',
  alignItems: 'center',
  justifyContent: 'center',
  paddingLeft: 8,
},

// DATE
heroDate: {
  fontFamily: 'Poppins-Bold',
  fontSize: 13,
  color: '#634F4B',
  letterSpacing: 0.4,
  textAlign: 'center',
  marginBottom: 2,
},

// GREETING
heroGreeting: {
  fontFamily: 'Poppins-Bold',
  fontSize: 21,
  color: '#FFD044',
  textAlign: 'center',
  lineHeight: 28,
  marginBottom: 16,
},

heroUserName: {
  color: '#634F4B',
},

// WORD OF THE DAY
wordOfDayBubble: {
  width: '96%',
  minHeight: 165,
  backgroundColor: '#FFD54F',
  borderRadius: 28,
  paddingHorizontal: 20,
  paddingVertical: 18,
  alignItems: 'center',
  justifyContent: 'center',

  // Soft floating effect
  elevation: 8,
  shadowColor: '#8A6200',
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.18,
  shadowRadius: 10,
  position: 'relative',
  // subtle border
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.45)',
},

// SPEECH ARROW
wordBubbleArrow: {
  position: 'absolute',
  left: -18,
  top: '50%',
  marginTop: -14,
  width: 0,
  height: 0,
  borderTopWidth: 14,
  borderBottomWidth: 14,
  borderRightWidth: 22,
  borderTopColor: 'transparent',
  borderBottomColor: 'transparent',
  borderRightColor: '#FFD54F',
},

// WORD
heroWord: {
  fontFamily: 'Poppins-Bold',
  fontSize: 30,
  color: '#421C00',
  textAlign: 'center',
  marginBottom: 4,
  letterSpacing: -0.5,
},

// TRANSLATION
heroTranslation: {
  fontFamily: 'Poppins-Medium',
  fontSize: 16,
  color: '#634F4B',
  textAlign: 'center',
  fontStyle: 'italic',
  lineHeight: 21,
},

// DEFINITION
heroWord: {
  fontFamily: 'Poppins-Bold',
  fontSize: 30,
  color: '#421C00',
  textAlign: 'center',
  marginBottom: 4,
  letterSpacing: -0.5,
},

// DETAILS
heroDetails: {
  fontFamily: 'Poppins-Bold',
  fontSize: 10.5,
  color: '#8A6200',
  textDecorationLine: 'underline',
  marginTop: 8,
},

progressSectionHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',

  marginTop: 15,
  marginBottom: 14,

  paddingHorizontal: 5,
},

progressSectionTitle: {
  fontFamily: 'Poppins-Bold',
  fontSize: 25,
  color: '#421C00',
  letterSpacing: -0.5,
},

progressSubtitle: {
  fontFamily: 'Poppins-Medium',
  fontSize: 11,
  color: '#9A8177',
  marginTop: 1,
},


// STREAK BADGE

streakBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFF7D6',
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#FFE28A',
},

activeDot: {
  width: 7,
  height: 7,
  borderRadius: 4,
  backgroundColor: '#F4B400',
  marginRight: 6,
},

streakBadgeText: {
  fontFamily: 'Poppins-Bold',
  fontSize: 9,
  color: '#8A6200',
  letterSpacing: 0.8,
},

progressCard: {
  backgroundColor: '#FFFDF5',
  borderRadius: 32,
  paddingHorizontal: 22,
  paddingTop: 22,
  paddingBottom: 18,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: '#F4E7BF',
  elevation: 7,
  shadowColor: '#8A6200',
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  position: 'relative',
  overflow: 'hidden',
},

progressBee: {
  position: 'absolute',
  width: 75,
  height: 75,
  right: -8,
  top: -10,
  opacity: 0.95,
  transform: [
    { rotate: '12deg' }
  ],
},
progressTopRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: 115,
},
streakSmallLabel: {
  fontFamily: 'Poppins-Bold',
  fontSize: 10,
  color: '#A58D80',
  letterSpacing: 1.3,
  marginBottom: 2,
},
streakNumberRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
},

streakNumberLarge: {
  fontFamily: 'Poppins-Bold',
  fontSize: 58,
  color: '#421C00',
  lineHeight: 64,
  letterSpacing: -2,
},

streakDays: {
  fontFamily: 'Poppins-Bold',
  fontSize: 14,
  color: '#8A6200',
  marginLeft: 7,
  letterSpacing: 1,
},
superStreakBadge: {
  alignSelf: 'flex-start',
  backgroundColor: '#421C00',
  paddingHorizontal: 11,
  paddingVertical: 5,
  borderRadius: 15,
  marginTop: 4,
},

superStreakText: {
  fontFamily: 'Poppins-Bold',
  fontSize: 9,
  color: '#FFD54F',
  letterSpacing: 0.4,
},

tripleFlameWrapper: {
  width: 105,
  height: 65,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  marginRight: 10,
},

centerFlame: {
  width: 100,
  height: 100,
  zIndex: 2,
},

sideFlame: {
  width: 100,
  height: 100,
  position: 'absolute',
  bottom: 4,
  opacity: 0.65,
},

leftFlame: {
  left: 100,
  transform: [
    { rotate: '-15deg' }
  ],
  zIndex: 1,
},
rightFlame: {
  right: 0,
  transform: [
    { rotate: '15deg' }
  ],
  zIndex: 1,
},
weeklyProgressContainer: {
  backgroundColor: '#FFFFFF',
  borderRadius: 23,
  paddingHorizontal: 13,
  paddingVertical: 13,
  borderWidth: 1,
  borderColor: '#F3E9D8',
},
weeklyProgressTitle: {
  fontFamily: 'Poppins-Bold',
  fontSize: 9,
  color: '#A58D80',
  letterSpacing: 1.2,
  marginBottom: 10,
  textAlign: 'center',
},
largeWeekRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

largeDayBox: {
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 35,
},

dayCircleLarge: {
  width: 34,
  height: 34,
  borderRadius: 17,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 5,
},

dayActive: {
  backgroundColor: '#FFD54F',
  borderWidth: 2,
  borderColor: '#F4B400',
  elevation: 3,
  shadowColor: '#D89B00',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.15,
  shadowRadius: 3,
},

dayInactive: {
  backgroundColor: '#F5F1EA',
  borderWidth: 1,
  borderColor: '#E8DED0',
},

checkMarkLarge: {
  fontSize: 15,
  color: '#421C00',
  fontFamily: 'Poppins-Bold',
},

lockIcon: {
  fontSize: 9,
  opacity: 0.35,
},

largeDayText: {
  fontSize: 8.5,
  fontFamily: 'Poppins-Bold',
  color: '#806F65',
  letterSpacing: 0.2,
},

// ========================================
// CHATBOT PROMO
// ========================================

chatPromoWrapper: {
  width: '100%',
  marginTop: 8,
  marginBottom: 25,
  position: 'relative',
},

chatPromoCard: {
  width: '100%',
  minHeight: 220,
  backgroundColor: '#FFF7D6',
  borderRadius: 32,
  borderWidth: 1.5,
  borderColor: '#FFD45A',
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 18,
  paddingVertical: 20,
  overflow: 'hidden',
  elevation: 7,
  shadowColor: '#B97800',
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.13,
  shadowRadius: 10,
},

// ========================================
// BEE
// ========================================

chatBeeContainer: {
  width: '40%',
  height: 180,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
},

chatPromoBee: {
  width: 130,
  height: 175,
  transform: [
    { rotate: '-3deg' }
  ],
},

// ========================================
// BEE CHAT BUBBLE
// ========================================

beeChatBubble: {
  position: 'absolute',
  top: 5,
  right: -2,
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 10,
  paddingVertical: 7,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: '#F2D98B',
  elevation: 3,
  shadowColor: '#8A6200',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.12,
  shadowRadius: 4,
},

beeChatText: {
  fontFamily: 'Poppins-Bold',
  fontSize: 9,
  color: '#634F4B',
},

// ========================================
// TEXT CONTENT
// ========================================

chatPromoContent: {
  width: '60%',
  paddingLeft: 5,
  paddingRight: 5,
},

chatPromoLabel: {
  fontFamily: 'Poppins-Bold',
  fontSize: 9,
  color: '#A47700',
  letterSpacing: 1.1,
  marginBottom: 3,
},

chatPromoTitle: {
  fontFamily: 'Poppins-Bold',
  fontSize: 23,
  color: '#421C00',
  lineHeight: 29,
  marginBottom: 7,
},

chatPromoTitleAccent: {
  color: '#F4B400',
},

chatPromoDescription: {
  fontFamily: 'Poppins-Medium',
  fontSize: 11.5,
  color: '#75635B',
  lineHeight: 17,
  marginBottom: 13,
},

// ========================================
// BUTTON
// ========================================

chatExploreBtn: {
  alignSelf: 'flex-start',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#421C00',
  paddingLeft: 15,
  paddingRight: 11,
  paddingVertical: 9,
  borderRadius: 18,
  elevation: 3,
  shadowColor: '#421C00',
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.18,
  shadowRadius: 4,
},

chatExploreBtnText: {
  fontFamily: 'Poppins-Bold',
  fontSize: 11,
  color: '#FFD54F',
},

chatExploreArrow: {
  fontFamily: 'Poppins-Bold',
  fontSize: 17,
  color: '#FFD54F',
  marginLeft: 7,
  marginTop: -2,
},

// ========================================
// FLOATING BUBBLES
// ========================================

chatBubbleSmall: {
  position: 'absolute',
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: '#FFD54F',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 5,
  elevation: 4,
  shadowColor: '#B97800',
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.15,
  shadowRadius: 4,
},

chatBubbleOne: {
  right: 15,
  top: -13,
},

chatBubbleTwo: {
  right: 55,
  bottom: -10,
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: '#FFF0B3',
},

chatBubbleEmoji: {
  fontSize: 14,
},
});