import { Dimensions, StyleSheet, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // --- MAIN CONTAINER ---
container: {
  flex: 1,
  backgroundColor: '#FFFFFF', // o kahit anong background color ng app mo
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Para sa Android
},
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 120, // Space para hindi matakpan ng Bottom Tab
    paddingTop: 10,
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

  // --- SECTION TITLES ---
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24, // Medyo pinalaki para sa "Lively" feel
    color: '#421C00',
    marginBottom: 12,
    marginTop: 5,
    letterSpacing: 0.5,
  },

  // --- LIVELY SECTION TITLE ---
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 15,
    paddingHorizontal: 5, // Konting hinga sa gilid
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 26,
    color: '#421C00', // Dark Brown para solid ang dating
    letterSpacing: -0.5,
  },
  titleAccent: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD54F', // Mantatili itong yellow para sa "Bee" theme
    marginLeft: 6,
    alignSelf: 'center',
    marginTop: 5,
  },

  // --- DARKER & BOLDER DISCOVER BADGE ---
  discoverBadge: {
    backgroundColor: '#421C00', // Ginawa nating Dark Brown ang background
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20, // Mas rounded para sa "Pill" look
    marginLeft: 12,
    // Subtle shadow para mag-pop up talaga
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  discoverBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: '#FFD54F', // Yellow text sa loob ng dark background para High Contrast
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // --- DISCOVER / WORD CARD (POP-UP VERSION) ---
  wordCard: {
    backgroundColor: '#FFD54F', // Solid yellow or you can use a gradient
    borderRadius: 35,
    padding: 25,
    // INALIS ANG BORDER COLOR PARA SA CLEANER LOOK
    borderWidth: 0,

    // LIGHTING & SHADOW (PARA SA POP-UP EFFECT)
    elevation: 12, // Mas mataas na elevation para sa Android
    shadowColor: '#FFAB00', // Warm shadow para mas lively
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,

    marginBottom: 20,
  },

  wordLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: 'rgba(66, 28, 0, 0.6)', // Semi-transparent brown for modern look
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  wordText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 52, // Pinalaki para sa "Lively" impact
    color: '#421C00',
    textAlign: 'center',
    marginVertical: 0,
    // Subtle text shadow para mag-pop ang mismong salita
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  wordDetails: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Soft glassmorphism effect sa loob
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },

  meaningText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    color: '#421C00',
  },

  usageText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#421C00',
    opacity: 0.7,
    marginTop: 2,
  },

  // --- LIVELY STREAK & STATS ---
  // --- LARGE STREAK CARD ---
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
    letterSpacing: -0.5,
  },
  
  // Orange Accent para sa Progress
  titleAccentOrange: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6F00', 
    marginLeft: 6,
    marginTop: 8,
  },
  // STREAK STATUS BADGE
  streakBadge: {
    backgroundColor: '#E8F5E9', // Light green background
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  streakBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: '#2E7D32', // Dark green text para sa "Active" status
    textTransform: 'uppercase',
  },

  largeStreakCard: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 25,
    marginVertical: 15,
    elevation: 15,
    shadowColor: '#FFAB00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#FDF2E9',
  },
  streakTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakNumberLarge: {
    fontFamily: 'Poppins-Bold',
    fontSize: 60, // BOLD & BIG!
    color: '#421C00',
    lineHeight: 65,
  },
  streakStatus: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#A0A0A0',
    letterSpacing: 2,
  },
  onFireBadge: {
    backgroundColor: '#FF6F00',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginTop: 5,
  },
  onFireText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  mainFlameIcon: {
    width: 90,
    height: 90,
  },
  // --- TRIPLE FLAME STYLING ---
  tripleFlameWrapper: {
    width: 120,
    height: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerFlame: {
    width: 85,
    height: 85,
    zIndex: 2,
  },
  sideFlame: {
    width: 55,
    height: 55,
    position: 'absolute',
    bottom: 5,
    opacity: 0.7, // Medyo transparent para mag-focus sa center
  },
  leftFlame: {
    left: 0,
    transform: [{ rotate: '-15deg' }], // Nakatagilid nang konti
    zIndex: 1,
  },
  rightFlame: {
    right: 0,
    transform: [{ rotate: '15deg' }], // Nakatagilid sa kabila
    zIndex: 1,
  },

  // --- RE-ADJUSTED STREAK CARD FOR 3 FLAMES ---
  largeStreakCard: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 25,
    marginVertical: 15,
    elevation: 20,
    shadowColor: '#FF6F00', // Mas "apoy" na shadow color
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#FDF2E9',
  },
  streakNumberLarge: {
    fontFamily: 'Poppins-Bold',
    fontSize: 65,
    color: '#421C00',
    lineHeight: 70,
  },
  onFireBadge: {
    backgroundColor: '#FF3D00', // Brighter Red-Orange
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 8,
  },

  // --- LARGE WEEKLY ROW ---
  largeWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  largeDayBox: {
    alignItems: 'center',
  },
  dayCircleLarge: {
    width: 34, // Pinalaki mula 22
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayActive: {
    backgroundColor: '#FFD54F',
    elevation: 4,
  },
  dayInactive: {
    backgroundColor: '#E0E0E0',
  },
  checkMarkLarge: {
    fontSize: 16,
    color: '#421C00',
    fontWeight: 'bold',
  },
  lockIcon: {
    fontSize: 10,
    opacity: 0.5,
  },
  largeDayText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#421C00',
  },

  // --- FOOTER BUTTON ---
  streakFooterBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#421C00',
    paddingVertical: 12,
    borderRadius: 20,
  },
  streakFooterText: {
    color: '#FFD54F',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    marginRight: 10,
  },
  arrowIcon: {
    color: '#FFD54F',
    fontSize: 18,
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
  });