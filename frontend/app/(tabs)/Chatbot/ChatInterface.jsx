import React, { useState } from 'react';
import { 
  Image, 
  SafeAreaView, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '../../../shared/styles/ChatInterfaceStyles'; 

export default function ChatInterface() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');

  const suggestions = [
    "How to change name?",
    "Do you have other games?",
    "How to use Dictionary?",
    "How can I translate?"
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image 
            source={require('../../../assets/icons/back_arrow.png')} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DialectBot</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* WELCOME AREA */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome to{"\n"}DialectBot</Text>
            <Text style={styles.welcomeSub}>
              DialectBot can help you navigate and learn more about DialectGo.
            </Text>
          </View>

          {/* SUGGESTION CHIPS */}
          <View style={styles.suggestionsContainer}>
            {suggestions.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.chip}
                onPress={() => setInputText(item)}
              >
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* INPUT BAR AREA */}
        <View style={styles.inputWrapper}>
          {/* Mic Button */}
          <TouchableOpacity style={styles.iconBtn}>
            <Image source={require('../../../assets/icons/micIcon.png')} style={styles.inputIcon} />
          </TouchableOpacity>

          {/* OCR/Camera Button */}
          <TouchableOpacity style={styles.iconBtn}>
            <Image source={require('../../../assets/icons/cameraIcon.png')} style={styles.inputIcon} />
          </TouchableOpacity>

          {/* Input Field */}
          <TextInput 
            style={styles.textInput}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
          />

          {/* Send Button */}
          <TouchableOpacity style={styles.sendBtn}>
            <Image source={require('../../../assets/icons/sendButton.png')} style={styles.sendIcon} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}