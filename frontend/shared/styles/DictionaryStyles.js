import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontFamily: 'Poppins-Bold',
    color: '#FFD54F',
    marginBottom: -10,
    letterSpacing: 0.5,
  },

  headerTitleBlack: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: '#421C00',
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
  backgroundColor: '#FFD54F',

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
    fontFamily: 'Poppins-Medium',
    color: '#421C00',
  },

  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#421C00',
  },

  // ==========================================
  // 4. ENTRY CARDS
  // ==========================================

  entryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 20,

    backgroundColor: '#FFFFFF',

    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },

  entryWord: {
    fontSize: 21,
    fontFamily: 'Poppins-Bold',
    color: '#2D1606',
  },

  entryTranslation: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
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
    borderColor: '#FFD54F',
  },

  tagText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#421C00',
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
  fontFamily: 'Poppins-Bold',
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
  backgroundColor: '#FFD54F',
  borderColor: '#FFD54F',
},

languageFilterText: {
  fontSize: 14,
  fontFamily: 'Poppins-Medium',
  color: '#666666',
},

activeLanguageFilterText: {
  fontFamily: 'Poppins-Bold',
  color: '#421C00',
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
  fontFamily: 'Poppins-Medium',
  color: '#4F3422',
},

activeAlphabetText: {
  color: '#FFFFFF',
  fontFamily: 'Poppins-Bold',
},
});

