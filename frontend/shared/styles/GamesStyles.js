import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
  },
  content: {
    paddingHorizontal: 25,
    // Binabaan natin ang padding para sumagad pataas tulad ng Dictionary
    paddingTop: Platform.OS === 'android' ? 5 : 5, 
  },
  
  /* --- PINAGANDANG HEADER (SAGAD VERSION) --- */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50, // Inalis ang margin para dikit sa bee icon
    marginBottom: 50, // Inalis ang bottom margin para lumapit ang subtext
  },
  textContainerHeader: {
    flexDirection: 'column',
    marginTop: -10, // Ito ang "magic" nudge para sumagad talaga pataas
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '400',
    color: '#263238',
    letterSpacing: -1.5,
    fontFamily: 'Poppins-Bold',
  },
  yellowText: {
    color: '#FBC02D',
  },
  titleUnderline: {
    height: 6,
    backgroundColor: '#FFD54F',
    width: 75,
    borderRadius: 10,
    marginTop: -5,
    marginLeft: 2,
  },
  welcomeSection: {
    marginBottom: 25, // Pinaliit ang gap para mas compact tignan
    marginTop: 0,
  },
  welcomeSub: {
    fontSize: 15,
    color: '#90A4AE',
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    lineHeight: 20,
    marginTop: -2, // Inangat din ang subtext para hindi mukhang bitin
  },

  /* --- GAME CARD STYLES --- */
  gameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30, 
    padding: 20,
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#cfd8dc',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  cardInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  iconBox: {
    width: 65,
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: { 
    flex: 1, 
    marginLeft: 15 
  },
  gameTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#263238',
    fontFamily: 'Poppins-Bold',
  },
  gameDesc: { 
    fontSize: 13, 
    color: '#78909C', 
    lineHeight: 19,
    fontFamily: 'Poppins-Regular',
  },

  /* --- BUTTON STYLES --- */
  getBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  getBtnText: { 
    color: '#FFF', 
    fontWeight: '800', 
    fontSize: 16, 
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* --- FOOTER SECTION --- */
  comingSoonContainer: { 
    alignItems: 'center', 
    marginTop: 10,
    paddingBottom: 40,
  },
  comingSoonText: { 
    fontSize: 12, 
    color: '#CFD8DC', 
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});