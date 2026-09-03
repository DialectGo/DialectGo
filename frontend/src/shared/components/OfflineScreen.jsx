import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OfflineScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={120} color="#FFD54F" style={styles.icon} />
        <Text style={styles.title}>You're Offline!</Text>
        <Text style={styles.subtitle}>
          DialectGo needs an active internet connection. Please check your Wi-Fi or mobile data to continue learning.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Dark background for emphasis
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', // Ensures it stays on top of layout
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999, // Highest z-index to block everything
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: width,
  },
  icon: {
    marginBottom: 24,
    opacity: 0.9,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 24,
  },
});
