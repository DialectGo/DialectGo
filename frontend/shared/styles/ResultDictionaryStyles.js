import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ==========================================
  // MAIN
  // ==========================================

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollPadding: {
    paddingHorizontal: 40,
    paddingBottom: 0,
  },

  // ==========================================
  // OFFLINE
  // ==========================================

  offlineBanner: {
    backgroundColor: '#D32F2F',
    paddingVertical: 7,
    paddingHorizontal: 15,
    alignItems: 'center',
  },

  offlineText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ==========================================
  // HERO CARD
  // ==========================================

  heroCard: {
    backgroundColor: '#FFD54F',
    borderRadius: 28,
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',

    shadowColor: '#4F3422',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#795548',
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  heroWord: {
    fontSize: 46,
    lineHeight: 52,
    fontWeight: '800',
    color: '#4F3422',
    textAlign: 'center',
  },

  heroPronounce: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#5D4037',
    marginTop: 6,
  },

  partOfSpeechBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#E8B923',
  },

  partOfSpeechText: {
    color: '#4F3422',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ==========================================
  // SECTION
  // ==========================================

  section: {
    marginTop: 26,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F3422',
    marginBottom: 12,
  },

  // ==========================================
  // LANGUAGE CARDS
  // ==========================================

  languageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,

    borderWidth: 1,
    borderColor: '#E8E1DB',

    shadowColor: '#4F3422',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  currentLanguageCard: {
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: '#FFD54F',
  },

  languageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  languageLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#795548',
    letterSpacing: 1,
  },

  currentBadge: {
    backgroundColor: '#FFD54F',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },

  currentBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#4F3422',
    letterSpacing: 0.5,
  },

  languageTerm: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F3422',
    marginBottom: 6,
  },

  languageDefinition: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5D4037',
  },

  // ==========================================
  // USAGE EXAMPLES
  // ==========================================

  exampleCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0DF9A',
  },

  exampleItem: {
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9DDB8',
  },

  exampleLanguage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F3422',
    marginBottom: 5,
  },

  exampleText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5D4037',
  },
// ==========================================
// SAVE BUTTON
// ==========================================

saveButtonWrapper: {
  position: 'absolute',
  bottom: 25,
  left: 0,
  right: 0,

  alignItems: 'center',

  backgroundColor: 'transparent',
  padding: 0,
},

saveButton: {
  height: 52,
  minWidth: 170,
  paddingHorizontal: 28,
  borderRadius: 28,

  // NOT SAVED
  backgroundColor: '#4F3422',

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',

  shadowColor: '#4F3422',
  shadowOffset: {
    width: 0,
    height: 5,
  },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
},

// ==========================================
// SAVED STATE
// ==========================================

savedButton: {
  // SAVED
  backgroundColor: '#FFD54F',

  shadowColor: '#C9A227',
  shadowOffset: {
    width: 0,
    height: 5,
  },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 8,
},

// ==========================================
// OFFLINE / DISABLED
// ==========================================

disabledSaveButton: {
  backgroundColor: '#A9A9A9',
},

// ==========================================
// STAR ICON
// ==========================================

// NOT SAVED = WHITE
starIcon: {
  width: 19,
  height: 19,
  marginRight: 9,

  tintColor: '#FFFFFF',

  resizeMode: 'contain',
},

// SAVED = BROWN
savedStarIcon: {
  tintColor: '#4F3422',
},

// ==========================================
// BUTTON TEXT
// ==========================================

// NOT SAVED = WHITE
saveButtonText: {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '900',
  letterSpacing: 0.5,
},

// SAVED = BROWN
savedButtonText: {
  color: '#4F3422',
},
});