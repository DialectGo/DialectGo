import React from 'react';
import { View } from 'react-native';
import { Text, Provider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';



export default function ImageToText() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBBF24' }}>
      <View style={{ marginTop: 100, backgroundColor: 'red', padding: 20 }}> 
        <Text style={{ fontSize: 30, color: 'black' }}>THIS IS IMAGE</Text>
      </View>
    </SafeAreaView>
  );
}