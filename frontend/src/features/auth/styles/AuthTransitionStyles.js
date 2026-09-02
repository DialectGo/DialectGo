import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // <--- GINAWANG CREAM (Background ng Logo screen)
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logo: {
    width: 130,
    height: 130,
  },
  brandText: {
    fontSize: 35,
    fontWeight: '900',
    color: '#FFC107', 
    marginTop: 10,
  },
  tagline: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 50,
    marginTop: 5,
  },
  buttonWrapper: {
    width: '100%',
    paddingHorizontal: 30,
    position: 'absolute',
    bottom: 60,
  },
  loginBtn: {
    backgroundColor: '#FFC107',
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
  },
  loginBtnText: { fontWeight: 'bold', fontSize: 18, color: '#000' },
  signUpBtn: {
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFC107',
    backgroundColor: 'transparent', // Para hindi mag-white ang loob
  },
  signUpBtnText: { fontWeight: 'bold', fontSize: 18, color: '#FFC107' },

  // --- ETO YUNG SHEET NA AANGAT ---
  animatedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height + 300, // Taller to prevent bottom gap when dragged up
    backgroundColor: 'transparent', // Transparent to let the white topHalf blend
  },

});