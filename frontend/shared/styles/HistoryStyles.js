import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, paddingTop: 15 },
  brandYellow: { fontSize: 24, fontWeight: 'bold', color: '#FFD54F', marginBottom: -10 },
  brandBlack: { fontSize: 36, fontWeight: 'bold', color: '#4F3422' },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconCircle: { width: 55, height: 55, borderRadius: 30, backgroundColor: '#FFD54F', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  iconCircleActive: { width: 55, height: 55, borderRadius: 30, backgroundColor: '#FFF9C4', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFD54F', elevation: 5 },
  topIcon: { width: 30, height: 30, resizeMode: 'contain' },
  
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 15 },
backBtnNoBg: {
  width: 45,
  height: 45,
  justifyContent: 'center',
  alignItems: 'flex-start', // Naka-align sa kaliwa
},

backImgLarge: {
  width: 30,
  height: 30,
  resizeMode: 'contain',
  tintColor: '#4F3422', // Siniguradong brown ang kulay para kita sa puting background
},  backImg: { width: 22, height: 22, tintColor: '#4F3422' },
  screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },

  listPadding: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 160 },

  // Card Design base sa Image
  historyCard: { 
    backgroundColor: '#FFF9E3', 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  labelUnderline: { fontSize: 14, color: '#4F3422', textDecorationLine: 'underline', flex: 1 },
  cardCategory: { fontSize: 13, color: '#666', position: 'absolute', left: '40%' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardStar: { width: 20, height: 20 },
  cardCheckbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#FFD54F', borderRadius: 5 },
  checkedBox: { backgroundColor: '#FFD54F' },
  
  cardBody: { marginTop: 2 },
  mainWordText: { fontSize: 22, fontWeight: '500', color: '#1A1A1A' },
  timestampText: { fontSize: 9, color: '#999', textAlign: 'right' },

  // FLOATING BAR STYLES
  floatingActionBar: {
    position: 'absolute',
    bottom: 95, 
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    gap: 20
  },
  deleteMainBtn: {
    backgroundColor: '#FFD54F',
    paddingVertical: 12,
    paddingHorizontal: 45,
    borderRadius: 25,
    elevation: 3
  },
  deleteBtnText: { fontWeight: 'bold', fontSize: 18, color: '#4F3422' },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  allLabel: { color: '#666', fontSize: 14 }
});