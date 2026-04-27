import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // ==========================================
  // 1. MAIN CONTAINER & CONTENT
  // ==========================================
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 40, // Dagdag space sa dulo para sa ScrollView
  },

  // ==========================================
  // 2. HEADER SECTION
  // ==========================================
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#421C00',
  },
  yellowText: {
    color: '#FFD54F',
  },
  titleUnderline: {
    width: 40,
    height: 4,
    backgroundColor: '#FFD54F',
    borderRadius: 2,
    marginTop: -2,
  },

  // ==========================================
  // 3. SELECTOR SECTION (Yellow Bar)
  // ==========================================
  selectorWrapper: {
    marginTop: 20,
    marginBottom: 10, // Mahalaga: Para itulak ang card pababa
    width: '100%',
  },
  selectorBar: {
    flexDirection: 'row',
    backgroundColor: '#FFD54F',
    height: 55,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    elevation: 5, // Para sa Android shadow
    shadowColor: '#000', // Para sa iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  langButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#421C00',
  },
  swapIcon: {
    width: 22,
    height: 22,
    tintColor: '#421C00',
    marginHorizontal: 10,
  },

  // ==========================================
  // 4. TRANSLATION CARDS (Input & Result)
  // ==========================================
translateCard: {
    marginTop: 20,
    backgroundColor: '#FFF9E1',
    borderRadius: 30,
    padding: 22,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Tinanggal ang justifyContent: 'space-between' dito 
    // para ang flex: 1 sa loob ang mag-control ng push.
  },
  mainInput: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#421C00',
    marginTop: 10,
    textAlignVertical: 'top',
    padding: 0,
    // Huwag lagyan ng flex: 1 dito para hindi lumitaw ang scrollbar sa loob ng textinput
  },
  inputLabel: {
    fontSize: 14,
    color: '#8E8E8E',
    fontFamily: 'Poppins-Medium',
  },
  resultText: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#000000',
    marginTop: 10,
  },

  // ==========================================
  // 5. SUGGESTIONS & FOOTER
  // ==========================================
  suggestionInsideCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#FFE8A1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
    marginVertical: 4,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#421C00',
  },
cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: 10, // Konting gap mula sa content sa taas
    borderTopWidth: 0, // Siguradong walang line
  },
  footerIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    tintColor: '#421C00',
  },
  // Siguraduhin na may ganito sa TranslateStyles.js mo:
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)', // Madilim na background
  justifyContent: 'center',
  alignItems: 'center',
},
dropdownMenu: {
  width: '80%',
  backgroundColor: '#FFFFFF',
  borderRadius: 15,
  padding: 20,
  elevation: 5, // Para sa Android shadow
  shadowColor: '#000', // Para sa iOS shadow
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},
dropdownItem: {
  paddingVertical: 15,
  paddingHorizontal: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F0F0',
  flexDirection: 'row',
  justifyContent: 'space-between',
},
dropdownItemText: {
  fontSize: 16,
  fontFamily: 'Poppins-Regular',
  color: '#333',
},
modalTitle: {
  fontSize: 18,
  fontFamily: 'Poppins-Bold',
  marginBottom: 15,
  textAlign: 'center',
  color: '#000',
}
});