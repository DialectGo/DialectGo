import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

export default function InnerShadowText() {
  const HEADER_TEXT = "Translate Now!";

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <MaskedView
          maskElement={<Text style={styles.titleText}>{HEADER_TEXT}</Text>}
        >
          <LinearGradient
            colors={['#EAB308', '#FDE047', '#CA8A04']}
            style={styles.gradient}
          >
            <Text style={styles.hiddenText}>{HEADER_TEXT}</Text>
          </LinearGradient>
        </MaskedView>
      </View>
      
      <Text style={styles.italicLabel}>
        You can translate ideas into more connective way.
      </Text>
      
      <Text style={styles.brandSubtitle}>
        Dialect/Language
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  headerWrapper: {
    height: 55, 
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 40,
    fontWeight: '900',
  },
  hiddenText: {
    fontSize: 40,
    fontWeight: '900',
    color: 'transparent',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gradient: {
    flex: 1,
    width: 300, 
  },
  italicLabel: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#4b5563',
    fontWeight: '300',
    marginTop: 5, 
  },
  brandSubtitle: {
    fontSize: 24,
    color: '#604B48',
    fontWeight: '700',
    marginTop: 10,
  },
});