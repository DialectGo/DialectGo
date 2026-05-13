import { Dimensions, StyleSheet } from 'react-native'; // Idagdag ang Dimensions dito

// Kunin ang width ng screen para gumana yung logoText width
const { width } = Dimensions.get('window');

// Dagdagan ng 'export' para ma-import sa ibang file
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150, // Fixed height para hindi gumalaw ang button pag labas ng text
  },
  beeContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  bee: {
    width: 110,
    height: 110,
  },
  logoText: {
    width: width * 0.7,
    height: 100,
    marginLeft: 65, 
  },
  buttonWrapper: {
    position: 'absolute', // Humihiwalay sa daloy ng ibang elements
    bottom: -250,           // Fix ito sa 80 pixels mula sa ilalim ng screen
    alignSelf: 'center'
  },
  button: {
    backgroundColor: '#FFD54F', // Yellow button
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    // SHADOWS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // Shadow para sa Android
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});