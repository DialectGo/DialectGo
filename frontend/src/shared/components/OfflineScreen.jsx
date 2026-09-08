import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function OfflineScreen() {
  return (
    <View style={styles.container}>


      {/* Foreground Layer */}
      <View style={styles.foregroundContainer}>
        {/* Background Layer (Absolute, inside foreground container to guarantee rendering order) */}
        <View style={styles.yellowBackgroundWrapper}>
          <View style={styles.yellowBackground} />
        </View>

        {/* Main Content Area */}
        <View style={styles.content}>
          <Image
            source={require('../../../assets/images/offline.png')}
            style={styles.mascot}
            resizeMode="contain"
          />

          <Text style={styles.title}>Connection Issue Detected</Text>

          <View style={styles.textBlock}>
            <Text style={styles.subtitle}>
              <Text style={{ fontFamily: 'Poppins-Bold', fontWeight: 'bold', color: '#333' }}>DialectGo </Text>
              requires an active internet connection to deliver real-time translations and language lessons.
            </Text>
            <Text style={[styles.subtitle, { marginTop: 15 }]}>
              Please check your Wi-Fi or mobile data.
            </Text>
            <Text style={[styles.subtitle, { marginTop: 15, fontStyle: 'italic' }]}>
              Once connected, we’ll automatically bring you back to your lesson.
            </Text>
          </View>

          {/* Footer Text */}
          <Text style={styles.footerText}>Waiting for network connection . . .</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
  },
  foregroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 90, 
  },
  yellowBackgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    overflow: 'hidden',
    zIndex: 0,
  },
  yellowBackground: {
    position: 'absolute',
    bottom: 0,
    left: -width * 0.5,
    right: -width * 0.5,
    height: height,
    backgroundColor: '#FFD54F',
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
  },
  mascot: {
    width: width * 0.85,
    height: height * 0.4,
    marginTop: 20,
    marginBottom: 60, // Pushed down to avoid yellow curve overlap
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
    fontSize: 22,
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  textBlock: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 22,
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: '#A0A0A0',
    textAlign: 'center',
    position: 'absolute',
    bottom: 40, 
  },
});
