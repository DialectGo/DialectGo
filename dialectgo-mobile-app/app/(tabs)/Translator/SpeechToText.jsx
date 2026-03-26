import React from 'react';
import { View } from 'react-native';
import { Button, Text, Provider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';



export default function SpeechToText() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBBF24' }}>
      <View style={{ marginTop: 100, backgroundColor: 'red', padding: 20 }}> 
        <Text style={{ fontSize: 30, color: 'black' }}>THIS IS SPEECH</Text>
        <Button onPress={() => router.push('/Translator/TextToText')} >
          Go to text
        </Button>
      </View>
    </SafeAreaView>
  );
}