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
    width: width,
    height: height,
    backgroundColor: '#FFFDE7', // <--- GINAWANG CREAM (Background ng mismong slider)
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    elevation: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  dragHandler: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#FFFDE7', // <--- GINAWANG CREAM (Match na sa LogIn content)
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  closeIndicator: {
    width: 60,
    height: 6,
    backgroundColor: '#D0D0D0', // Ginawang medyo darker gray para kita sa cream
    borderRadius: 3,
  }
});