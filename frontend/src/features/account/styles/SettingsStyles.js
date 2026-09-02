import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollBody: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25,
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