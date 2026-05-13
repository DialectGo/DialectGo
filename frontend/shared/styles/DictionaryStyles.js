import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 25,
    paddingTop: 5,
  },

  // ==========================================
  // 1. HEADER (ALIGNED)
  // ==========================================
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', 
    paddingHorizontal: 25,
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
    gap: 8, // Mas maliit na gap para sa mas maliliit na icons
  },

  // ==========================================
  // 2. ICON CIRCLE (PINALIIT)
  // ==========================================
  iconCircle: {
    width: 45, // Mula 55, ginawang 45
    height: 45, // Mula 55, ginawang 45
    borderRadius: 22.5,
    backgroundColor: 'transparent', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  topIcon: {
    width: 38, // Mula 50, ginawang 38 para sakto sa loob
    height: 38, // Mula 50, ginawang 38
    resizeMode: 'contain',
  },

  // ==========================================
  // 3. SEARCH BAR
  // ==========================================
  searchContainer: {
    marginHorizontal: 25,
    backgroundColor: '#FFD54F',
    borderRadius: 30,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Poppins-Medium',
    color: '#421C00',
  },
  searchIcon: {
    width: 20, // Pinalit din ang search icon nang kaunti
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
    paddingVertical: 22,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  entryWord: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#2D1606',
  },
  entryTranslation: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#9E9E9E',
  },
  tagContainer: {
    backgroundColor: '#FFF176',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    minWidth: 100,
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#421C00',
    textTransform: 'uppercase',
  }
});