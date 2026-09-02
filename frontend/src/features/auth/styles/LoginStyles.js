import { Dimensions, StyleSheet } from 'react-native';
const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // --- HEADER SECTION (WHITE BG) ---
  topHalf: {
    paddingTop: 40,
    paddingHorizontal: 25,
    paddingBottom: 60, // Space for the jeep to drive
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  welcomeTextBold: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    color: '#FFC107',
  },
  welcomeSubtitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#421C00',
    marginTop: 5,
  },

  // --- YELLOW MODAL CARD ---
  loginCard: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 250, // Extra padding to prevent gap when dragged up
    paddingHorizontal: 25,
    backgroundColor: '#FFFDE7',
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40,
    minHeight: height, // Full height to cover screen when dragged up
    elevation: 20,              // Upward Shadow for Android
    shadowColor: '#000',        // Shadow for iOS
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  dragHandler: {
    width: '100%',
    paddingTop: 20,
    paddingBottom: 25,
    alignItems: 'center',
  },
  closeIndicator: {
    width: 60,
    height: 6,
    backgroundColor: '#D0D0D0',
    borderRadius: 3,
  },
  cardLabel: {
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
    fontSize: 28,               
    color: '#421C00',           
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 25, // Reduced from 45
  },

  // --- FORM ELEMENTS WITH SHADOW ---
  inputGroup: {
    marginBottom: 12, // Reduced from 20
  },
  labelShadow: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: '#421C00',
    marginBottom: 8,
    marginLeft: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  bubbleInput: {
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#F9F9F9',
    paddingVertical: 16,
    paddingHorizontal: 25,
    borderRadius: 30, 
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    // Elevation shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20, // Reduced from 30
    marginRight: 10,
  },
  forgotText: {
    fontFamily: 'Poppins-Medium',
    color: '#FFC107',
    fontSize: 14,
  },

  // --- LOG IN BUTTON WITH GLOW SHADOW ---
  bubblePrimaryBtn: {
    backgroundColor: '#FFC107',
    paddingVertical: 18,
    borderRadius: 30, 
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  primaryBtnText: {
    fontFamily: 'Poppins-Bold',
    color: '#000',
    fontSize: 18,
    fontStyle:'bold',
  },

  // --- FULL WIDTH GOOGLE BUTTON ---
  googleBtnContainer: {
    width: '100%',
    marginBottom: 10,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  googleBtnText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#374151',
    marginLeft: 10,
  },
  soonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15, // Reduced from 30
  },
  line: { flex: 1, height: 1, backgroundColor: '#F0F0F0' },
  lineText: { 
    fontFamily: 'Poppins-Bold', 
    paddingHorizontal: 15, 
    color: '#CCC', 
    fontSize: 13 
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40, // Added margin to clear bottom navigation bar
  },
  footerText: { 
    fontFamily: 'Poppins-Regular', 
    fontSize: 15,
    color: '#A0A0A0'
  },
  footerLink: { 
    fontFamily: 'Poppins-Bold', 
    fontSize: 15,
    color: '#421C00'
  },
});