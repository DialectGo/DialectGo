import React, { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

// GO UP TWO LEVELS: components/ -> shared/ -> frontend/ -> assets/
import beeImg from '../../assets/logo/bee.png';
import dialectTextImg from '../../assets/logo/dialectgo_text.png';

// Path for styles (Assuming they are in shared/styles/)
import { styles } from '../shared/theme/OnboardingStyles';

const { width } = Dimensions.get('window');

const DATA = [
  {
    id: '1',
    title: 'Translate with Ease!',
    description: 'Speak freely and connect easily with DialectGo, your go-to translator for Tagalog, English, and Cebuano',
    image: beeImg,
  },
  {
    id: '2',
    title: 'Smart Dictionary',
    description: 'Discover different translations for the same word and learn how to use them in context with our smart dictionary feature.',
    image: dialectTextImg,
  },
  {
    id: '3',
    title: 'Ready to Start?',
    description: 'Log in now to begin your trilingual translation journey.',
    image: beeImg,
  },
];

export default function Onboarding({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleNext = () => {
    if (currentIndex < DATA.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Trigger the finish callback (e.g., to go to Login screen)
      if (onFinish) onFinish();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        ref={slidesRef}
      />

      <View style={styles.indicatorContainer}>
        {DATA.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 25, 10],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} key={i} />;
        })}
      </View>

      <TouchableOpacity 
        style={styles.nextButton} 
        activeOpacity={0.8}
        onPress={handleNext}
      >
        <Text style={styles.nextText}>
          {currentIndex === DATA.length - 1 ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}