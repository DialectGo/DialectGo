import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 25,
    borderRadius: 35,
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  saveBtn: {
    backgroundColor: '#FFD54F',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#2D1606',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
});