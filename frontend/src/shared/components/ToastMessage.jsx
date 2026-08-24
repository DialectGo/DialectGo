import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colorPalette';

/**
 * A global reusable Toast Notification component.
 * It is managed by ToastContext and drops down from the top of the screen.
 * 
 * @param {boolean} visible - Controls visibility
 * @param {string} message - Main text to display
 * @param {string} title - Optional title text
 * @param {string} type - 'success', 'error', 'info'
 */
export default function ToastMessage({ visible, message, title, type = 'info' }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-150)).current;

  // The distance it should drop down (status bar height + small padding)
  const topOffset = Math.max(insets.top, 20) + 10;

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
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, topOffset]);

  let iconName = 'information-circle';
  let themeColor = colors.info;

  if (type === 'success') {
    themeColor = colors.success;
    iconName = 'checkmark-circle';
  } else if (type === 'error') {
    themeColor = colors.error;
    iconName = 'alert-circle';
  }

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }],
          borderLeftColor: themeColor,
        }
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Ionicons name={iconName} size={28} color={themeColor} style={styles.icon} />
      
      <View style={styles.textContainer}>
        {title ? <Text style={styles.titleText}>{title}</Text> : null}
        <Text style={styles.messageText}>{message}</Text>
      </View>
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  icon: {
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
