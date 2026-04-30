import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' }, 
  
headerAction: {
  flexDirection: 'row',
  justifyContent: 'space-between', // Para maghiwalay ang back, title, at icons
  alignItems: 'center',
  paddingHorizontal: 25,
  paddingTop: 20,
  marginBottom: 20,
},
  leftHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#421C00',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  actionCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12, // Space sa pagitan ng back at history
    elevation: 3,
  },
  backIcon: { width: 24, height: 24 }, 
  headerIconSmall: { 
    width: 22, 
    height: 22, 
    tintColor: '#421C00' 
  },
  topLabel: { 
    fontSize: 14, 
    fontFamily: 'Poppins-Bold', 
    color: '#ADB5BD', 
    letterSpacing: 1,
    textAlign: 'right',
  },

  scrollContent: { paddingBottom: 120 },

  // Yellow Hero Card
  yellowHeroCard: {
    backgroundColor: '#FFD54F',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 35,
    padding: 30,
    paddingTop: 20,
    elevation: 8,
    alignItems: 'center',
  },
  bookmarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(66, 28, 0, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  starIcon: { width: 18, height: 18, marginRight: 8 },
  bookmarkText: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#421C00' },
  displayWord: { fontSize: 64, fontFamily: 'Poppins-Bold', color: '#000000' },
  pronounceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  syllableText: { fontSize: 22, fontFamily: 'Poppins-Medium', color: '#421C00', marginRight: 15 },
  audioBtn: { padding: 12, backgroundColor: '#421C00', borderRadius: 15 },
  audioIcon: { width: 20, height: 20, tintColor: '#FFD54F' },

  // Content Sections
  contentSection: { paddingHorizontal: 25, marginTop: 30 },
  sectionTitle: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#421C00', marginBottom: 15 },
  descriptionBox: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 4,
    borderLeftWidth: 8, 
    borderLeftColor: '#FFD54F',
  },
  posIndicator: { backgroundColor: '#421C00', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
  posLabel: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#FFD54F', textTransform: 'uppercase' },
  descriptionText: { fontSize: 20, fontFamily: 'Poppins-Regular', color: '#000000', lineHeight: 28 },
  usageCard: { backgroundColor: '#FFFFFF', borderRadius: 30, padding: 25, elevation: 4 },
  usageItem: { paddingVertical: 10 },
  langTag: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#8E8E8E', marginBottom: 4 },
  exampleText: { fontSize: 18, fontFamily: 'Poppins-Medium', color: '#000000' },
  divider: { height: 1.5, backgroundColor: '#F1F3F5', marginVertical: 10 },
});