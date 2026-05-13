import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');
const gap = 12; // Compact gap para sa levels
const horizontalPadding = 30; // Para compact sa gitna
const itemWidth = (width - (20 * 2) - 15) / 2; // Game Choices
const levelItemWidth = (width - (horizontalPadding * 2) - (gap * 2)) / 3; // Levels

export const styles = StyleSheet.create({
  // --- GENERAL CONTAINERS ---
  container: {
    flex: 1,
    backgroundColor: '#FFF9E1',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#FFF9E1',
    paddingHorizontal: 20,
    justifyContent: 'flex-end', // Push content to bottom
    paddingBottom: 40,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#FFF9E1', 
  },

  // --- HEADER & NAVIGATION ---
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 10,
  },
  
// --- TOP BAR & PROGRESS BAR STYLES ---
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50, // Adjustment para sa notch ng phone
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%', // Siguraduhing may width ang container
    height: 16,
    backgroundColor: '#E0E0E0', // Kulay ng "empty" na bar
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#421C00',
    overflow: 'hidden', // Importante: para hindi lumampas ang kulay sa rounded corners
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD54F', // Lively Yellow fill
    borderRadius: 8,
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#421C00',
    elevation: 3,
  },
  heartText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '900',
    color: '#F44336',
  },

  // --- LOGO & TITLES ---
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#421C00',
    textAlign: 'center',
    lineHeight: 48,
  },

  // --- QUESTION SECTION ---
  questionSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  hintText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7D6E5D',
    marginBottom: 10,
  },
  questionCard: {
    backgroundColor: '#FFF',
    width: '100%',
    paddingVertical: 50,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#421C00',
    elevation: 5,
    borderBottomWidth: 8,
    borderBottomColor: '#D7CCC8',
  },
  questionWord: {
    fontSize: 48,
    fontWeight: '900',
    color: '#421C00',
  },

  // --- LEVEL SELECTION SECTION ---
  levelWrapper: {
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  levelInstructionContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  levelInstructionText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF7043',
    textTransform: 'uppercase',
  },
  levelSubText: {
    fontSize: 13,
    color: '#7D6E5D',
    fontWeight: '600',
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  levelBtn: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderWidth: 2,
    borderColor: '#421C00',
    elevation: 4,
  },
  levelNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#421C00',
  },

  // --- DYNAMIC LEVEL STATES ---
  completedLevel: {
    backgroundColor: '#81C784', // Green
    borderColor: '#2E7D32',
    borderBottomWidth: 6,
    borderBottomColor: '#1B5E20',
  },
  currentLevel: {
    backgroundColor: '#FFD54F', // Yellow
    borderColor: '#421C00',
    borderBottomWidth: 6,
    borderBottomColor: '#D4A017',
  },
  unlockedLevel: { // For compatibility
    backgroundColor: '#FFD54F',
    borderBottomWidth: 6,
    borderBottomColor: '#D4A017',
  },
  lockedLevel: {
    backgroundColor: '#E0E0E0',
    borderColor: '#9E9E9E',
    borderBottomWidth: 3,
    borderBottomColor: '#BDBDBD',
    opacity: 0.6,
  },

  // --- MENU & CHOICE BUTTONS ---
  menuWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  mainButton: {
    backgroundColor: '#FF7043',
    width: '90%',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#421C00',
    borderBottomWidth: 6,
    borderBottomColor: '#BF360C',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    width: '90%',
    paddingVertical: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#421C00',
    borderBottomWidth: 4,
    borderBottomColor: '#421C00',
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#421C00',
  },

  // --- GAME CHOICES ---
  choicesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  choiceBtn: {
    backgroundColor: '#FFF',
    width: itemWidth,
    height: 85,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#421C00',
    borderBottomWidth: 6,
    borderBottomColor: '#D1D1D1',
    elevation: 3,
  },
  choiceLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#421C00',
  },

  // --- FEEDBACK ---
  correctChoice: {
    backgroundColor: '#81C784',
    borderColor: '#2E7D32',
    borderBottomColor: '#1B5E20',
  },
  wrongChoice: {
    backgroundColor: '#FF8A80',
    borderColor: '#C62828',
    borderBottomColor: '#8E0000',
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.7)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: '#FFF9E1',
  width: '85%',
  padding: 30,
  borderRadius: 30,
  borderWidth: 4,
  borderColor: '#421C00',
  alignItems: 'center',
  elevation: 20,
},
modalTitle: {
  fontSize: 26,
  fontWeight: '900',
  color: '#421C00',
  marginTop: 15,
  marginBottom: 10,
  textAlign: 'center',
},
settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 5,
  },
  settingsLabel: {
    fontSize: 18,
    color: '#421C00',
    fontWeight: '600',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF9E1',
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#421C00',
    elevation: 20,
  },
});