import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD54F', // Base yellow para sa StatusBar at Bottom area
  },
  header: {
    backgroundColor: '#FFD54F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#FFF9C4',
    padding: 10,
    borderRadius: 12,
    elevation: 3,
  },
  backIcon: { 
    width: 20, 
    height: 20,
    resizeMode: 'contain'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  whiteBackground: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 60, // Space para sa kurbada ng menu
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
  },
  streakText: {
    fontSize: 14,
    color: '#8E8E8E',
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#FFD54F',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: 40,
    paddingHorizontal: 25,
    marginTop: -50, // Hinihila ang menu paitaas para sa radius effect
  },
  menuItem: {
    backgroundColor: '#FFF9C4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 22,
    marginBottom: 12,
    elevation: 3,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#421C00',
  },
  arrowIcon: {
    width: 18,
    height: 18,
    tintColor: '#421C00',
  },
});