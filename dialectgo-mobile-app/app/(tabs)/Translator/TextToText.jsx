import React from 'react';
import { View } from 'react-native';
import { Text, Provider, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';



export default function TextToText() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBBF24' }}>
        <View className="px-6 py-2">
            <Text className="text-2xl font-bold mt-10 align-items-center justify-center text-center">
                Translation
            </Text>
        </View>
        <View>
            <TextInput
            label="Enter text to translate"
            mode="outlined"
            style={{ margin: 40, padding: 40, borderRadius:20 }}
            />
        </View>
        <View>
            <TextInput
            label="Translated text will appear here"
            mode="outlined"
            style={{ margin: 40, padding: 40, }}
            />
        </View>
    </SafeAreaView>
  );
}