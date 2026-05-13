import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD54F',
    paddingVertical: 20,
    paddingHorizontal: 15,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 5,
  },
  backIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 24,
    color: '#2D1606',
    fontFamily: 'Poppins-Bold',
    fontWeight: '900',
  },
  scrollBody: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25, // Dinagdagan para hindi dikit sa gilid ang mga menu text
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatarImg: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 15,
    fontFamily: 'Poppins-Bold',
  },
  streakText: {
    fontSize: 16,
    color: '#777',
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },

  // ==========================================
  // UPDATED MENU ITEMS (NO CONTAINER)
  // ==========================================
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20, // Tinaasan ang vertical padding para sa spacing
    marginBottom: 5,     // Konting gap sa ilalim ng bawat line
    borderBottomWidth: 1, // Optional: Manipis na linya para sa separation
    borderBottomColor: '#F0F0F0', 
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 28,
    height: 28,
    marginRight: 20,
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 18,
    color: '#2D1606',
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
  },
  arrowIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    opacity: 0.3, // Ginawang subtle ang arrow
  },

  // ==========================================
  // UPDATED LOGOUT (NO CONTAINER)
  // ==========================================
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 25,
    marginTop: 10,
  },
  logoutIcon: {
    width: 28,
    height: 28,
    marginRight: 20,
    resizeMode: 'contain',
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    fontFamily: 'Poppins-Bold',
  },
});