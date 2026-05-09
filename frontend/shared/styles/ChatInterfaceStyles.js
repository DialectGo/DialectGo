import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 60,
    backgroundColor: '#FFD54F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 4,
  },
  backButton: {
    width: 35,
    height: 35,
    backgroundColor: '#FFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 18,
    height: 18,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 35, // Para mag-center ang title kahit may back button
  },
  scrollContent: {
    paddingBottom: 100, // Space para sa floating input bar
  },
  welcomeSection: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD54F',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSub: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginTop: 40,
    alignItems: 'center',
    width: '100%',
  },
  chip: {
    backgroundColor: '#FFD54F',
    width: width * 0.8,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  // --- INPUT BAR STYLES ---
  inputWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  iconBtn: {
    width: 35,
    height: 35,
    backgroundColor: '#FFD54F',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  inputIcon: {
    width: 18,
    height: 18,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFF',
    height: 35,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#D1D1D1',
  },
  sendBtn: {
    width: 40,
    height: 35,
    backgroundColor: '#FFD54F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    width: 20,
    height: 20,
    transform: [{ rotate: '0deg' }], // Adjust orientation kung kailangan
  }
});