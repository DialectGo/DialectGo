import React, { useRef, useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Padding horizontally is 25 on each side in Home screen
const CAROUSEL_WIDTH = SCREEN_WIDTH - 50; 

const CAROUSEL_DATA = [
  {
    id: '1',
    image: require('../../../assets/images/home_carousel_featured/home_carousel_1.png'),
    btnColor: '#6F078D',
    btnTextColor: '#FFFFFF',
    btnText: 'Drop some Lingo!',
    route: '/Translator/Translate'
  },
  {
    id: '2',
    image: require('../../../assets/images/home_carousel_featured/home_carousel_2.png'),
    btnColor: '#FFD34C',
    btnTextColor: '#2D1606',
    btnText: 'Drop some Lingo!',
    route: '/Wiki/WikiFeed'
  }
];

export default function HomeCarousel() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.itemContainer, { width: CAROUSEL_WIDTH }]}>
        <View style={styles.imageWrapper}>
          <Image source={item.image} style={styles.image} resizeMode="contain" />
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: item.btnColor }]}
            activeOpacity={0.85}
            onPress={() => router.push(item.route)}
          >
            <Text style={[styles.buttonText, { color: item.btnTextColor }]}>{item.btnText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={CAROUSEL_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Swipe Indicators */}
      {currentIndex < CAROUSEL_DATA.length - 1 && (
        <View style={styles.rightArrowContainer} pointerEvents="none">
          <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
        </View>
      )}
      
      {currentIndex > 0 && (
        <View style={styles.leftArrowContainer} pointerEvents="none">
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </View>
      )}

      <View style={styles.paginationContainer}>
        {CAROUSEL_DATA.map((_, index) => {
          const isActive = currentIndex === index;
          return (
            <View 
              key={index} 
              style={[
                styles.dot, 
                isActive ? styles.activeDot : styles.inactiveDot
              ]} 
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
    alignItems: 'center',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '88%',
    aspectRatio: 504 / 674,
    borderRadius: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  button: {
    position: 'absolute',
    bottom: '7%',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  dot: {
    width: 30, // Make them a bit wider for pill shape similar to screenshot
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFD34C',
  },
  inactiveDot: {
    backgroundColor: '#E5E7EB',
    width: 10,
  },
  rightArrowContainer: {
    position: 'absolute',
    right: 35,
    top: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftArrowContainer: {
    position: 'absolute',
    left: 35,
    top: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
