import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Match sa main background ng DialectGo
  },
  
  /* --- MODAL STYLES --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '90%',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    elevation: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#421C00',
    marginTop: 10,
    fontFamily: 'Poppins-Bold',
  },
  instructionText: {
    fontSize: 16,
    color: '#607D8B',
    lineHeight: 24,
    textAlign: 'left',
    fontFamily: 'Poppins-Regular',
  },

  /* --- MENU & NAVIGATION --- */
  menuWrapper: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  mainButton: {
    width: '100%',
    backgroundColor: '#FF9800', // Word Bridge Orange Theme
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryButton: {
    marginTop: 20,
    padding: 10,
  },
  secondaryButtonText: {
    color: '#421C00',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
  },

  /* --- LEVEL GRID STYLES --- */
  levelWrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 50,
  },
  levelBtn: {
    width: (width - 80) / 4, // 4 levels per row
    height: (width - 80) / 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    backgroundColor: '#FFF',
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: '900',
  },
  
  /* --- LEVEL STATUS COLORS --- */
  currentLevel: {
    borderColor: '#FF9800', // Orange highlight para sa active level
    backgroundColor: '#FFF8E1',
    elevation: 5,
  },
  completedLevel: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  lockedLevel: {
    borderColor: '#ECEFF1',
    backgroundColor: '#F8F9FB',
  },

  /* --- SETTINGS ROW --- */
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263238',
  }
});