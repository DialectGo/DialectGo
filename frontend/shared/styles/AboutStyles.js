import { Platform, StatusBar, StyleSheet } from 'react-native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FDFDFD' 
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : STATUSBAR_HEIGHT,
    height: Platform.OS === 'ios' ? 90 : 64 + STATUSBAR_HEIGHT,
    backgroundColor: '#FFD54F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    elevation: 10,       // Tumaas ang elevation para sa Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    zIndex: 9999,        // Siniguradong nasa pinakataas
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#421C00' 
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 15,
    zIndex: 10000,       // Button mismo ay may mataas na zIndex
  },
  backIcon: { 
    width: 20, 
    height: 20, 
    tintColor: '#421C00' 
  },

  scrollContent: { paddingBottom: 40 },

  logoSection: {
    alignItems: 'center',
    paddingVertical: 45,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#FFD54F',
    shadowOpacity: 0.4,
    marginBottom: 20,
  },
  logoImg: { width: 85, height: 85, resizeMode: 'contain' },
  appName: { fontSize: 30, fontWeight: '900', color: '#263238' },
  appTagline: { fontSize: 14, color: '#78909C', fontWeight: '600', marginTop: 6 },
  
  versionBadge: {
    marginTop: 18,
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  versionText: { fontSize: 12, color: '#546E7A', fontWeight: '800' },

  infoCard: {
    margin: 20,
    padding: 25,
    backgroundColor: '#FFF',
    borderRadius: 25,
    elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#421C00', marginBottom: 12 },
  cardBody: { fontSize: 15, color: '#546E7A', lineHeight: 24, textAlign: 'justify' },

  sectionLabel: { 
    fontSize: 13, 
    fontWeight: '900', 
    color: '#B0BEC5', 
    marginLeft: 25, 
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 20,
  },
  techItem: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 22,
    width: '28%',
    elevation: 5,
  },
  techEmoji: { fontSize: 26, marginBottom: 8 },
  techName: { fontSize: 11, fontWeight: '800', color: '#455A64', textAlign: 'center' },

  footerSection: {
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 25,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginHorizontal: 40,
  },
  footerTitle: { fontSize: 13, color: '#90A4AE', fontWeight: '600' },
  devName: { fontSize: 17, fontWeight: '900', color: '#421C00', marginTop: 6 },
  copyright: { fontSize: 11, color: '#CFD8DC', marginTop: 12 }
});