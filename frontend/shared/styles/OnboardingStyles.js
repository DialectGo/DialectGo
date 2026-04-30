import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  slide: { 
    width, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  image: { 
    width: width * 0.6, 
    height: width * 0.6, 
    marginBottom: 40 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#FBC02D', 
    textAlign: 'center' 
  },
  description: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginTop: 10, 
    paddingHorizontal: 20 
  },
  indicatorContainer: { 
    flexDirection: 'row', 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  dot: { 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#FBC02D', 
    marginHorizontal: 5 
  },
  nextButton: {
    backgroundColor: '#FFD54F',
    marginHorizontal: 40,
    marginBottom: 40, // Para hindi masyadong dikit sa baba
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
    // SHADOWS (Tulad ng dati nating button)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  nextText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000' 
  },
});