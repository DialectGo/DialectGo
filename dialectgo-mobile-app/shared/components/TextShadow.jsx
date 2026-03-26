import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

export default function InnerShadowText() {
  return (
    <View style={styles.container}>
      <MaskedView
        maskElement={
          <Text style={styles.text}>
            Translate Now!
          </Text>
        }
      >
        <LinearGradient
          colors={['#EAB308', '#FDE047', '#CA8A04']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <Text
            style={[
              styles.text,
              {
                color: 'transparent',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 3,
              },
            ]}
          >
            Translate Now!
          </Text>
        </LinearGradient>
      </MaskedView>
      
      <Text style={styles.subText}>
        You can translate ideas into more connective way.
      </Text>
      <Text style={styles.subText1}>
        Dialect/Language
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'flex-start',
  },
  text: {
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 60, 
    marginTop: -15,
  },
  gradient: {
    height: 70,
    width: 500,
  },
  subText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#374151',
    marginTop: -25,
    fontWeight: '300',
    marginBottom: 10,
  },
    subText1: {
    fontSize: 25,
    color: '#604B48',
    marginTop: -5,
    fontWeight: '700',
    marginBottom: -25,
  },
});