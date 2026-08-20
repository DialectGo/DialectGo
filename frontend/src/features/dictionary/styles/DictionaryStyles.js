import { StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colorPalette';
import { fonts } from '../../../shared/theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  listContent: {
    paddingHorizontal: 30,
    paddingTop: 5,
    paddingBottom: 30,
  },

  contentWrapper: {
  paddingHorizontal: 10,
},
  // ==========================================
  // 1. HEADER
  // ==========================================

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',

    // Same spacing from screen edge
    paddingHorizontal: 30,
    paddingTop: 20,
    marginBottom: 25,
  },

  titleWrapper: {
    flexDirection: 'column',
  },

  headerTitleYellow: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.primary,
    marginBottom: -10,
    letterSpacing: 0.5,
  },

  headerTitleBlack: {
    fontSize: 36,
    fontFamily: fonts.bold,
    color: colors.accent,
    fontWeight: '900',
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // ==========================================
  // 2. ICON CIRCLE
  // ==========================================

iconCircle: {
  width: 55,
  height: 55,
  backgroundColor: 'transparent',

  justifyContent: 'center',
  alignItems: 'center',

  shadowColor: 'transparent',
  elevation: 0,
},
  topIcon: {
    width: 58,
    height: 58,
    resizeMode: 'contain',
  },

  // ==========================================
  // 3. SEARCH BAR
  // ==========================================

  searchContainer: {
  backgroundColor: colors.primary,

  borderRadius: 30,
  height: 60,

  flexDirection: 'row',
  alignItems: 'center',

  paddingHorizontal: 22,

  marginBottom: 25,
},

  searchInput: {
    flex: 1,

    fontSize: 17,
    fontFamily: fonts.medium,
    color: colors.accent,
  },

  searchIcon: {
    width: 20,
    height: 20,
    tintColor: colors.accent,
  },

  // ==========================================
  // 4. ENTRY CARDS
  // ==========================================

  entryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 20,

    backgroundColor: colors.background,

    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },

  entryWord: {
    fontSize: 21,
    fontFamily: fonts.bold,
    color: '#2D1606',
  },

  entryTranslation: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#8D817A',

    marginTop: 2,
  },

  tagContainer: {
    backgroundColor: '#FFF9E6',

    paddingVertical: 7,
    paddingHorizontal: 14,

    borderRadius: 18,

    minWidth: 95,

    alignItems: 'center',

    borderWidth: 1,
    borderColor: colors.primary,
  },

  tagText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // ==========================================
// 5. FILTERS
// ==========================================

filterSection: {
  marginTop: 2,
  marginBottom: 20,
},

filterLabel: {
  fontSize: 12,
  fontFamily: fonts.bold,
  color: '#8D817A',
  letterSpacing: 0.8,
  marginBottom: 9,
  textTransform: 'uppercase',
},

// ==========================================
// LANGUAGE FILTERS
// ==========================================

languageFilterRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},

languageFilter: {
  height: 42,
  paddingHorizontal: 19,

  borderRadius: 22,

  backgroundColor: '#F7F7F7',

  borderWidth: 1,
  borderColor: '#E2E2E2',

  justifyContent: 'center',
  alignItems: 'center',
},

activeLanguageFilter: {
  backgroundColor: colors.primary,
  borderColor: colors.primary,
},

languageFilterText: {
  fontSize: 14,
  fontFamily: fonts.medium,
  color: '#666666',
},

activeLanguageFilterText: {
  fontFamily: fonts.bold,
  color: colors.accent,
},

// ==========================================
// ALPHABET FILTERS
// ==========================================

alphabetSection: {
  marginTop: 18,
},

alphabetRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 9,
},

alphabetButton: {
  width: 48,
  height: 48,

  borderRadius: 24,

  backgroundColor: '#F7F7F7',

  justifyContent: 'center',
  alignItems: 'center',
},

activeAlphabetButton: {
  backgroundColor: '#4F3422',
},

alphabetText: {
  fontSize: 15,
  fontFamily: fonts.medium,
  color: '#4F3422',
},

activeAlphabetText: {
  color: colors.background,
  fontFamily: fonts.bold,
},
});

