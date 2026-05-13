import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD54F', // Pinanatili ang yellow header base sa image_fc6bc3.png
    height: 80,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 8,
    borderRadius: 12,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#2D1606',
  },
  headerTitle: {
    fontSize: 24,
    color: '#2D1606',
    fontFamily: 'Poppins-Bold',
    fontWeight: '900',
  },
  scrollBody: {
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F5F5F5', // Ginawang light grey ang circle background ng avatar
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  bigFireIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  userName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#2D1606',
    marginTop: 10,
    fontFamily: 'Poppins-Bold',
  },
  streakSubtext: {
    fontSize: 18,
    color: '#777',
    fontWeight: '600',
  },
  settingsContainer: {
    backgroundColor: '#F8F9FA', // Mula Yellow, ginawang Light Grey/White background
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 35,
    flex: 1,
    minHeight: 500,
    // Dagdag shadow para lumitaw ang card section
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  whiteCard: {
    backgroundColor: '#FFFFFF', // Ginawang pure white ang cards
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#2D1606',
    marginBottom: 15,
    opacity: 0.5,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  activeDayCircle: {
    backgroundColor: '#FFD54F', // Dito na lang itinira ang yellow bilang accent
    borderWidth: 0,
  },
  inactiveDayCircle: {
    backgroundColor: '#F0F0F0',
  },
  checkIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: '#2D1606',
  },
  dayLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#2D1606',
  },
  milestoneDesc: {
    fontSize: 16,
    color: '#2D1606',
    fontFamily: 'Poppins-Medium',
    marginBottom: 15,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD54F', // Yellow progress bar para sa visual pop
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  statItem: {
    backgroundColor: '#FFFFFF', // Puti na rin ang stat boxes
    width: '48%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statNumber: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#2D1606',
  },
  statSub: {
    fontSize: 12,
    color: '#2D1606',
    opacity: 0.5,
  },
});