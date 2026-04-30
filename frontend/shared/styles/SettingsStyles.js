import { Platform, StatusBar, StyleSheet } from 'react-native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F9FC' 
  },
  header: {
    paddingTop: STATUSBAR_HEIGHT,
    height: Platform.OS === 'ios' ? 90 : 64 + STATUSBAR_HEIGHT,
    backgroundColor: '#FFD54F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    zIndex: 1000,
    // No Border Radius as requested
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#421C00' 
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
  },
  backIcon: { width: 20, height: 20, tintColor: '#421C00' },
  
  scrollContent: { padding: 20 },

  section: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A0A0A0',
    marginBottom: 10,
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
  },
  subtitleText: {
    fontSize: 13,
    color: '#90A4AE', // Muted grey para sa subtitle
    fontWeight: '500',
    marginTop: 2,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: '#CFD8DC',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#B0BEC5',
    fontSize: 12,
    fontWeight: '600',
  },
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Mas madilim na background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    elevation: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#421C00',
    marginBottom: 15,
  },
  modalBody: {
    fontSize: 15,
    color: '#607D8B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  modalOption: {
    width: '100%',
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#455A64',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD54F',
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 20,
  },
  closeBtnText: {
    fontWeight: '800',
    color: '#421C00',
  }
});