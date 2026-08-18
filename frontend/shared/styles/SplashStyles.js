import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({

  // ======================================================
  // MAIN CONTAINER
  // ======================================================

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ======================================================
  // CONTENT
  // ======================================================

  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  // ======================================================
  // LOGO AREA
  // ======================================================

  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },

  // ======================================================
  // BEE
  // ======================================================

  beeContainer: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bee: {
    width: 110,
    height: 110,
  },

  // ======================================================
  // DIALECTGO TEXT LOGO
  // ======================================================

  logoText: {
    width: width * 0.7,
    height: 100,
    marginLeft: 65,
  },

  // ======================================================
  // BUTTON
  // ======================================================

  buttonWrapper: {
    position: 'absolute',
    bottom: -250,
    alignSelf: 'center',
  },

  button: {
    backgroundColor: '#FFD54F',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },

});