import { Platform, StatusBar as RNStatusBar, StyleSheet } from 'react-native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : RNStatusBar.currentHeight;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8' // Mas "fresh" na light blue-grey
  },
  header: {
    paddingTop: STATUSBAR_HEIGHT,
    height: Platform.OS === 'ios' ? 90 : 64 + STATUSBAR_HEIGHT,
    backgroundColor: '#FFD54F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    zIndex: 1000,
    // INALIS ANG BORDER RADIUS DITO PARA MAGING FLAT
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#424242',
    letterSpacing: 0.5
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Subtle circle background
    borderRadius: 20,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#333'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60
  },

  // MAIN STREAK CARD (The "Fire" Card)
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingVertical: 35,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#FF8F00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FFF8E1',
  },
  bigFireIcon: {
    width: 110,
    height: 110,
    marginBottom: 5,
    resizeMode: 'contain',
    // Tip: Pwede mong lagyan ng glow effect dito sa assets mo
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FF6F00', // Mas matapang na orange
    textShadowColor: 'rgba(255, 111, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  streakSubtext: {
    fontSize: 22,
    color: '#455A64',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  motivationText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#78909C',
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 30,
    lineHeight: 22
  },

  // WEEK GRID
  sectionContainer: {
    marginBottom: 30,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    color: '#263238'
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dayColumn: { alignItems: 'center' },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5
  },
  activeDayCircle: {
    backgroundColor: '#FFD54F',
    borderColor: '#FFCA28',
    elevation: 4,
    shadowColor: '#FFCA28',
    shadowOpacity: 0.4,
  },
  inactiveDayCircle: {
    backgroundColor: '#ECEFF1',
    borderColor: '#CFD8DC'
  },
  checkIcon: { width: 20, height: 20, tintColor: '#FFF' },
  dayLabel: { fontSize: 14, color: '#546E7A', fontWeight: '700' },

  // STATS
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statBox: {
    backgroundColor: '#FFF',
    width: '47%',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    borderBottomWidth: 5,
    borderBottomColor: '#FFD54F', // Parang Duolingo style button
  },
  statValue: { fontSize: 26, fontWeight: '900', color: '#263238' },
  statLabel: { fontSize: 13, color: '#90A4AE', fontWeight: '600', marginTop: 2 },

  // MILESTONE
  milestoneCard: {
    backgroundColor: '#263238',
    padding: 25,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#263238',
    shadowOpacity: 0.3,
  },
  milestoneTitle: {
    color: '#FFD54F',
    fontWeight: '900',
    fontSize: 18,
    textTransform: 'uppercase'
  },
  milestoneDesc: {
    color: '#B0BEC5',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
    fontWeight: '500'
  },
  progressBarBg: {
    height: 14,
    backgroundColor: '#37474F',
    borderRadius: 10,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD54F',
    borderRadius: 10,
    // Tip: Pwede mo itong lagyan ng "shine" effect sa UI
  },
});