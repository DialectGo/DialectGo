import React, { useEffect, useRef } from 'react';
import { ScrollView, RefreshControl, View, Text, Animated, Easing } from 'react-native';

export default function RefreshContainer({
  children,
  onRefresh,
  refreshing,
  contentContainerStyle,
  ...props
}) {
  // Animated value for the pulsing text and progress bar shimmer
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (refreshing) {
      // Loop a pulsing animation while refreshing is active
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.5,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0.5);
    }
  }, [refreshing]);

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ TARGETED VISUAL INDICATOR: Displays a loading status bar at the top when true */}
      {refreshing && (
        <Animated.View 
          style={{
            backgroundColor: '#FFFDE7', // Soft yellow background
            borderBottomWidth: 1,
            borderBottomColor: '#FFD54F',
            paddingVertical: 6,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            opacity: fadeAnim, // Applies the pulse effect
          }}
        >
          <Text 
            style={{ 
              color: '#421C00', 
              fontSize: 12, 
              fontWeight: 'bold',
              letterSpacing: 0.5
            }}
          >
            RELOADING...
          </Text>
        </Animated.View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        {...props}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD54F" // Color for iOS spinner
            colors={['#FFD54F', '#421C00']} // Colors for Android spinner
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        {children}
      </ScrollView>
    </View>
  );
}