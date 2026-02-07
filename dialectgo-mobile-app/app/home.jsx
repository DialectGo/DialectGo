import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { BottomNavigation } from 'react-native-paper';

const DictionaryRoute = () => (
  <View style={styles.centered}>
    <Text>Dictionary Screen</Text>
  </View>
);

const AIRoute = () => (
  <View style={styles.centered}>
    <Text>AI Screen</Text>
  </View>
);

const TranslateRoute = () => (
  <View style={styles.centered}>
    <Text>Translate Screen</Text>
  </View>
);

const Home = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'dictionary', title: 'Dictionary', icon: 'book' },
    { key: 'ai', title: 'AI', icon: 'robot' },
    { key: 'translate', title: 'Translate', icon: 'translate' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    dictionary: DictionaryRoute,
    ai: AIRoute,
    translate: TranslateRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{
        backgroundColor: '#808080', // background color of the bar 
        borderTopWidth: 1, // Optional: Add a border at the top
        borderTopColor: '#ddd', // Optional: Border color
      }}
      activeColor="#ffffff" // Color of the active button
      inactiveColor="#b0bec5" // Color of the inactive buttons
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;