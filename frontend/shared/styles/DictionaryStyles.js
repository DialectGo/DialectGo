import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ==========================================
  // 1. MAIN CONTAINER
  // ==========================================
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
listContent: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 120, // Dinagdagan para hindi takpan ng BottomNav
  },
  // ==========================================
  // 2. HEADER STYLES
  // ==========================================
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 20,
    marginBottom: 20,
  },
headerTitleYellow: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#FFD54F',
    lineHeight: 26, // Binawasan para hindi masyadong banat
  },  headerTitleBlack: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#421C00',
    lineHeight: 34,
  },
  headerIcons: {
    flexDirection: 'row',
  },
topIcon: {
    width: 22,
    height: 22,
    tintColor: '#421C00', // Ito ang magpapakulay sa icons para mag-pop!
    resizeMode: 'contain',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD54F', // Yellow base gaya ng nasa image mo
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 3, // Shadow para mas lively
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  // ==========================================
  // 3. SEARCH BAR STYLES
  // ==========================================
  searchContainer: {
    marginHorizontal: 25,
    backgroundColor: '#FFD54F',
    borderRadius: 30,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#421C00',
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#421C00',
  },

  // ==========================================
  // 4. ENTRY CARD STYLES
  // ==========================================
  entryCard: {
    backgroundColor: '#FFF9E1',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  entryWord: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#421C00',
  },
  entryTranslation: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#8E8E8E',
  },
  tagContainer: {
    backgroundColor: '#FFE8A1',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#421C00',
  },

  // ==========================================
  // 5. FLOATING ELEMENTS
  // ==========================================
  floatingBot: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  botIcon: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
    color: '#8E8E8E',
    marginTop: 50,
  }
});