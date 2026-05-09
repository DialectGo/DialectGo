import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  
  // Header configuration
  topHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 15 
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandYellow: { fontSize: 24, fontWeight: 'bold', color: '#FFD54F', marginBottom: -8 },
  brandBlack: { fontSize: 36, fontWeight: 'bold', color: '#4F3422' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#FFD54F', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 3 
  },
  topIcon: { width: 26, height: 26, resizeMode: 'contain' },

  // Back Button - No Background
backBtnNoBg: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Siguraduhing walang background color
    marginRight: 10,
  },
  backImgLarge: {
    width: 25, // Lakihan natin ng kaunti
    height: 25,
    resizeMode: 'contain',
    tintColor: '#4F3422', // Gawin nating brown ang arrow para tumugma sa "Dictionary" text
  },
  // Search Bar
  searchWrapper: { paddingHorizontal: 25, marginTop: 15 },
  searchContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#FFD54F', 
    borderRadius: 20, 
    alignItems: 'center', 
    paddingHorizontal: 15,
    height: 50
  },
  searchInput: { flex: 1, fontSize: 18, color: '#4F3422', fontWeight: '500' },
  searchIcon: { width: 20, height: 20, tintColor: '#4F3422' },

  scrollPadding: { paddingHorizontal: 25, paddingBottom: 150 },

  // Main Card & Definitions
  mainWordCard: { 
    backgroundColor: '#FFD54F', 
    borderRadius: 25, 
    padding: 30, 
    marginTop: 20, 
    alignItems: 'center',
  },
  heroWord: { fontSize: 60, fontWeight: 'bold', color: '#4F3422' },
  heroPronounce: { fontSize: 22, fontStyle: 'italic', color: '#4F3422', marginTop: -5 },
  definitionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  defColumn: { width: '47%', alignItems: 'center' },
  posLabel: { fontSize: 16, fontStyle: 'italic', color: '#666', marginBottom: 10 },
  defBox: { 
    backgroundColor: '#FFF9E3', 
    borderRadius: 15, 
    padding: 20, 
    width: '100%', 
    alignItems: 'center',
    minHeight: 120,
    elevation: 2
  },
  defHeader: { fontSize: 16, fontWeight: 'bold', color: '#4F3422', marginBottom: 10 },
  defText: { fontSize: 16, color: '#4F3422', textAlign: 'center' },

  // Examples
  exampleSection: { marginTop: 30 },
  exampleTitle: { fontSize: 18, fontWeight: 'bold', color: '#4F3422', marginBottom: 10 },
  exampleContent: { paddingLeft: 10 },
  exampleLine: { fontSize: 16, color: '#4F3422', marginBottom: 5 },
  boldLabel: { fontWeight: 'bold' },

  // Floating Bookmark Button
  floatingSaveBtn: {
    position: 'absolute',
    bottom: 95,
    alignSelf: 'center',
    backgroundColor: '#4F3422',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
  },
  activeSaveBtn: { backgroundColor: '#2D1606' },
  starIcon: { width: 20, height: 20, marginRight: 10 },
  bookmarkText: { fontSize: 16, fontWeight: 'bold' },
});