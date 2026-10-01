import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import * as Updates from 'expo-updates';

const { width } = Dimensions.get('window');

export default function UpdateRestartModal() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkForUpdates();
  }, []);

  // Entrance animation when modal becomes visible
  useEffect(() => {
    if (updateAvailable) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();

      // Start pulsing the icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [updateAvailable]);

  async function checkForUpdates() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        setUpdateAvailable(true);
      }
    } catch (e) {
      // Silently fail — don't block the user if update check fails
      console.log('Update check failed:', e.message);
    }
  }

  async function handleRestart() {
    setIsRestarting(true);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    // Give a brief moment for the animation to show, then reload
    setTimeout(async () => {
      await Updates.reloadAsync();
    }, 1600);
  }

  if (!updateAvailable) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal
      visible={updateAvailable}
      transparent={true}
      animationType="none"
      onRequestClose={() => {}}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Update Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: pulseAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.iconRing}>
              <Text style={styles.iconText}>↻</Text>
            </View>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>New Update Available!</Text>

          {/* Description */}
          <Text style={styles.description}>
            <Text style={styles.appName}>DialectGo </Text>
            has a new update ready. Please restart the app to apply the latest improvements and features.
          </Text>

          {/* Restart Button */}
          <TouchableOpacity
            style={[
              styles.restartButton,
              isRestarting && styles.restartButtonDisabled,
            ]}
            onPress={handleRestart}
            disabled={isRestarting}
            activeOpacity={0.8}
          >
            {isRestarting ? (
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[styles.progressBar, { width: progressWidth }]}
                />
                <Text style={styles.restartButtonText}>Restarting...</Text>
              </View>
            ) : (
              <Text style={styles.restartButtonText}>Restart Now</Text>
            )}
          </TouchableOpacity>

          {/* Footer note */}
          <Text style={styles.footerNote}>
            This won't take long — just a quick restart ✨
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width - 48,
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF7E0',
    borderWidth: 3,
    borderColor: '#FDCE4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 36,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  appName: {
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  restartButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minHeight: 56,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  restartButtonDisabled: {
    backgroundColor: '#FCD34D',
  },
  restartButtonText: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    zIndex: 1,
  },
  progressBarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
  },
  footerNote: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
});
