import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' // Light grey background para malinis
  },
  header: {
    // Inalign sa 80px gaya ng mga naunang screens
    height: 80, 
    backgroundColor: '#FFD54F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center ang title horizontally
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    position: 'relative',
    zIndex: 9999,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#2D1606', // Inalign ang color sa dark brown ng ibang screens
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  backButton: {
    position: 'absolute', // Absolute para hindi ma-disturb ang centering ng title
    left: 20,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    zIndex: 10000,
  },
  backIcon: { 
    width: 20, 
    height: 20, 
    tintColor: '#2D1606' 
  },

  scrollContent: { paddingBottom: 40 },

  logoSection: {
    alignItems: 'center',
    paddingVertical: 45,
    backgroundColor: '#FFFFFF',
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F5F5F5', // Binuwasan ang pagka-yellow, ginawang light grey
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    marginBottom: 20,
  },
  logoImg: { width: 85, height: 85, resizeMode: 'contain' },
  appName: { fontSize: 30, fontWeight: '900', color: '#2D1606' },
  appTagline: { fontSize: 14, color: '#8D8D8D', fontWeight: '600', marginTop: 6 },
  
  versionBadge: {
    marginTop: 18,
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  versionText: { fontSize: 12, color: '#8D8D8D', fontWeight: '800' },

  infoCard: {
    margin: 20,
    padding: 25,
    backgroundColor: '#FFFFFF', // Pure white card
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#2D1606', marginBottom: 12 },
  cardBody: { fontSize: 15, color: '#546E7A', lineHeight: 24, textAlign: 'justify' },

  sectionLabel: { 
    fontSize: 12, 
    fontWeight: '900', 
    color: '#BDBDBD', 
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
    backgroundColor: '#FFFFFF', // White cards para sa tech items
    padding: 15,
    borderRadius: 22,
    width: '28%',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  techEmoji: { fontSize: 26, marginBottom: 8 },
  techName: { fontSize: 11, fontWeight: '800', color: '#2D1606', textAlign: 'center' },

  footerSection: {
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 25,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginHorizontal: 40,
  },
  footerTitle: { fontSize: 12, color: '#BDBDBD', fontWeight: '600' },
  devName: { fontSize: 17, fontWeight: '900', color: '#2D1606', marginTop: 6 },
  copyright: { fontSize: 11, color: '#CFD8DC', marginTop: 12 }
});