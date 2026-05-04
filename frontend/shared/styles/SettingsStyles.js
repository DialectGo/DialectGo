import { StyleSheet, Platform } from 'react-native';

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
    height: 80, // Inalign sa kaparehong height ng ibang screens
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Boxed look gaya ng hiningi mo kanina
    padding: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#2D1606',
  },
  headerTitle: {
    fontSize: 24,
    color: '#2D1606',
    fontFamily: 'Poppins-Bold',
    fontWeight: '900',
  },
  scrollBody: {
    backgroundColor: '#FFFFFF',
  },
  topSpacer: {
    height: 20, // Binawasan ang spacer para mas compact
    backgroundColor: '#FFFFFF',
  },
  settingsContainer: {
    backgroundColor: '#F8F9FA', // Mula Yellow, ginawang Light Grey para malinis
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 25,
    paddingTop: 40,
    flex: 1,
    minHeight: 600,
    // Subtle shadow para sa section transition
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#2D1606',
    marginBottom: 15,
    marginLeft: 5,
    opacity: 0.4, // Mas subtle na label
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuCard: {
    backgroundColor: '#FFFFFF', // Ginawang Pure White para hindi puro yellow
    borderRadius: 30,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F5F5F5', // Light grey circle para sa icon
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#2D1606',
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#2D1606',
  },
  subtitleText: {
    fontSize: 12,
    color: '#2D1606',
    opacity: 0.5,
    fontFamily: 'Poppins-Medium',
  },
  arrowIcon: {
    width: 18,
    height: 18,
    opacity: 0.3,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#2D1606',
    opacity: 0.3,
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  // Modal Styles - Pinanatiling malinis
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 25,
    maxHeight: '70%',
    elevation: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#2D1606',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalBodyScroll: {
    marginBottom: 20,
  },
  modalBodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    fontFamily: 'Poppins-Medium',
  },
  closeBtn: {
    backgroundColor: '#FFD54F', // Yellow button sa loob ng modal para sa accent
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#2D1606',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
});