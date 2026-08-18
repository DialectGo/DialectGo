import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function CustomButton({ title, onPress, loading, className = "", style }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
      className={`items-center justify-center ${className}`}
      style={style} 
    >
      {loading ? (
        <ActivityIndicator color="black" />
      ) : (
        <Text className="text-black font-black text-lg uppercase tracking-tighter">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}