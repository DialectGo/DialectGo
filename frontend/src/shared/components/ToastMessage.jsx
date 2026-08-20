import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A global reusable Toast Notification component.
 * Drops down from the top of the screen to display success, error, or info messages.
 * 
 * @param {boolean} visible - Controls visibility
 * @param {string} message - Text to display
 * @param {string} type - 'success', 'error', 'info'
 * @param {number} topOffset - Dynamic offset from the top (usually safe area inset + some padding)
 */
export default function ToastMessage({ visible, message, type = 'info', topOffset = 50 }) {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: topOffset,
        useNativeDriver: true,
        bounciness: 12,
        speed: 14,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, topOffset]);

  let bgColor = '#3B82F6'; // Default Blue
  let iconName = 'information-circle';

  if (type === 'success') {
    bgColor = '#10B981'; // Green
    iconName = 'checkmark-circle';
  } else if (type === 'error') {
    bgColor = '#EF4444'; // Red
    iconName = 'alert-circle';
  }

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { backgroundColor: bgColor, transform: [{ translateY }] }
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Ionicons name={iconName} size={24} color="#FFF" style={styles.icon} />
      <Text style={styles.messageText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    marginRight: 12,
  },
  messageText: {
    color: '#FFFFFF', // colors.white
    fontSize: 14,
    flex: 1,
  },
});
