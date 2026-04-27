import { Dimensions, StyleSheet } from 'react-native';
const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7', 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // --- HEADER: PABABAIN PA NATIN ---
  headerContainer: {
    paddingTop: 60,             // Adjusted para sa breathing room sa taas
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,           
    paddingHorizontal: 20,
  },
  miniLogo: {
    width: 80, 
    height: 80,
    marginRight: 15,
  },
  brandGroup: {
    justifyContent: 'center',
  },
  welcomeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  welcomeTextBold: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#ffdb0c',
    textShadowColor: 'rgba(255, 219, 12, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // --- WHITE BUBBLE CARD ---
  loginCard: {
    marginHorizontal: 20,
    paddingVertical: 35,
    paddingHorizontal: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 40, 
    elevation: 10,              // Shadow for Android
    shadowColor: '#000',        // Shadow for iOS
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  cardLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 25,               // 25px Bold
    color: '#421C00',           
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 45,           
  },

  // --- FORM ELEMENTS WITH SHADOW ---
  inputGroup: {
    marginBottom: 20,
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
    marginBottom: 30,
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

  // --- SOCIAL BUTTONS WITH LOGOS ---
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  bubbleSocialBtn: {
    flex: 0.47,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 25, 
    borderWidth: 4,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  socialText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: '#555',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
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