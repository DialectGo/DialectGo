import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 65,
    backgroundColor: '#FFD54F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 35,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 18,
    height: 18,
    tintColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004AAD',
    // Tinanggal ang underline para mas malinis/simple
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  characterImg: {
    width: 220, // Bahagyang linuitan para sa better breathing room
    height: 220,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28, // Liniitan mula 32
    fontWeight: 'bold',
    color: '#333', // Ginawang dark grey/black imbes na yellow para mas readable
    textAlign: 'center',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  startBtn: {
    backgroundColor: '#FFD54F',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 15, // Less rounded (modern-flat look)
    // Minimal shadow lang
    elevation: 0, 
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
});