import { Platform, StatusBar, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD' // Hindi pure white para hindi masakit sa mata
  },
  header: {
    backgroundColor: '#FFD54F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    // INALIS ANG BORDER RADIUS DITO PARA MAGING SAGAD AT FLAT
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
  }, headerTitle: {
    fontSize: 22,
    fontWeight: '900', // Extra bold para sa lively feel
    color: '#421C00',
    letterSpacing: 0.5
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 12,
    borderRadius: 15,
    elevation: 2
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#421C00'
  },

  // AVATAR SECTION
  avatarSection: {
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15
  },
  avatarCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 6,
    borderColor: '#FFD54F',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  editAvatarBtn: {
    backgroundColor: '#421C00', // Darker contrast para "pumopok"
    padding: 10,
    borderRadius: 25,
    marginTop: -35,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  editIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF'
  },

  // FORM SECTION
  formSection: {
    paddingHorizontal: 25,
    paddingTop: 15
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A0A0A0', // Subtle label
    marginBottom: 6,
    marginLeft: 10,
    textTransform: 'uppercase'
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    borderWidth: 1.5,
    borderColor: '#FFF9C4', // Very light yellow border
  },
  textInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#421C00',
    paddingVertical: 14
  },

  // SAVE BUTTON
  saveButton: {
    backgroundColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 22,
    marginTop: 25,
    elevation: 6,
    shadowColor: '#FFD54F',
    shadowOpacity: 0.4,
    borderBottomWidth: 4, // Duolingo/Lively style 3D effect
    borderBottomColor: '#FBC02D',
    marginBottom: 50,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#421C00'
  },

  // MODAL STYLES (Mas playful na modal)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(66, 28, 0, 0.6)', // Warm dark overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 35,
    padding: 25,
    alignItems: 'center',
    elevation: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#421C00',
    marginBottom: 25
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  avatarOption: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 4,
    borderColor: '#F5F5F5',
    overflow: 'hidden',
  },
  activeAvatarOption: {
    borderColor: '#FFD54F',
    transform: [{ scale: 1.1 }] // Slight pop for active
  },
  modalAvatarImg: {
    width: '100%',
    height: '100%'
  },
  closeBtn: {
    marginTop: 25,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    width: '100%',
    alignItems: 'center'
  },
  closeBtnText: {
    color: '#421C00',
    fontWeight: '800',
    fontSize: 15
  },
});