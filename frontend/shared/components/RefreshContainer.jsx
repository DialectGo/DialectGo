import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';

export default function RefreshContainer({
  children,
  onRefresh,
  refreshing,
  contentContainerStyle,
  ...props
}) {
  return (
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
  );
}