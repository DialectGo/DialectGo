import React from 'react';
// Add Pressable to this list!
import { Text, View, Pressable } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import "../global.css";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
       <View className="flex-1 items-center justify-center p-6">
         <Pressable className="mt-8 rounded-2xl bg-sky-500 py-4 px-8 active:bg-sky-700">
            <Text className="text-center font-bold text-white text-lg">
               Test Interaction
            </Text>
         </Pressable>
       </View>
    </SafeAreaView>
  );
}