import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import mascotImage from '../../../assets/icons/chatbotIcon1.png';

// Gemini API constants (need ito api key )
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are DialectBot, a friendly Filipino language learning assistant for the DialectGo app.
You help users with Cebuano, Tagalog, and English translations, pronunciation, and conversation practice.
Always respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "text": "Short headline answer or translation",
  "subtext": "1-3 lines of explanation, examples, or usage tips"
}`;

//constants for suggestions and initial bot message
const SUGGESTIONS = [
  'How to change name?',
  'Do you have other games?',
  'How to use Dictionary?',
  'How can I translate?',
];

const INITIAL_BOT_MESSAGE = {
  id: '1',
  sender: 'bot',
  text: "Kumusta! I'm DialectBot!",
  subtext:
    'I can help you with Cebuano, Tagalog, and English translations, pronunciation, or practice conversation.\nWhat would you like to learn today?',
};

// main part
export default function Learn() {
  const router = useRouter();
  const [screen, setScreen] = useState('splash'); // 'splash' or  'suggestions' or 'chat'
  const [messages, setMessages] = useState([INITIAL_BOT_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const chatHistory = useRef([]);

  // send message and call the gemini api
  const sendMessage = async (text) => {
    setScreen('chat');

    const newUserMsg = { id: Date.now().toString(), sender: 'user', text };
    setMessages((prev) => [...prev, newUserMsg]);
    setLoading(true);

    chatHistory.current.push({ role: 'user', parts: [{ text }] });

    try {
      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: chatHistory.current,
          generationConfig: { maxOutputTokens: 300 },
        }),
      });

      const data = await response.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

      chatHistory.current.push({ role: 'model', parts: [{ text: raw }] });

      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: parsed.text || 'Hmm, di ko gets!',
          subtext: parsed.subtext || '',
        },
      ]);
    } catch (error) {
      console.error('Gemini API error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Pasensya na!',
          subtext: 'Something went wrong. Please check your connection and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // splash screen with mascot and start button
  if (screen === 'splash') {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DialectBot</Text>
        </View>

        <View style={styles.splashBody}>
          <Image source={mascotImage} style={styles.mascot} resizeMode="contain" />
          <Text style={styles.splashTitle}>Welcome to{'\n'}DialectBot</Text>
          <Text style={styles.splashSubtext}>
            DialectBot can help you navigate and learn{'\n'}more about DialectGo.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setScreen('suggestions')}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // suggestion screen with buttons for common questions
  if (screen === 'suggestions') {
    return (
      <SafeAreaView style={styles.container}>


        <View style={styles.header}>
          <Text style={styles.headerTitle}>DialectBot</Text>
        </View>

        <View style={styles.suggestionsBody}>
          <View style={styles.suggestionsWelcome}>
            <Text style={styles.welcomeTitle}>Welcome to{'\n'}DialectBot</Text>
            <Text style={styles.welcomeSubtext}>
              DialectBot can help you navigate and learn{'\n'}more about DialectGo.
            </Text>
          </View>

          <View style={styles.suggestionButtonsContainer}>
            {SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionButton}
                onPress={() => sendMessage(suggestion)}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestionButtonText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ChatInput onSend={sendMessage} disabled={loading} />
      </SafeAreaView>
    );
  }

  //chat screen
  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.header}>
        <Text style={styles.headerTitle}>DialectBot</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.typingContainer}>
          <ChatBubble
            message={{
              id: 'typing',
              sender: 'bot',
              text: 'DialectBot is typing...',
              subtext: '',
            }}
          />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatInput onSend={sendMessage} disabled={loading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFCB45',
    height: 60,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333333',
    letterSpacing: 0.3,
  },

  splashContainer: {
    flex: 1,
    backgroundColor: '#FFCB45', // yellow fills the safe area top on splash
  },
  splashBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  mascot: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFCB45',
    textAlign: 'center',
    lineHeight: 36,
  },
  splashSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 21,
  },
  startButton: {
    backgroundColor: '#FFCB45',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 64,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#FFCB45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333333',
  },

  suggestionsBody: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  suggestionsWelcome: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFCB45',
    textAlign: 'center',
    lineHeight: 34,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 21,
  },
  suggestionButtonsContainer: {
    paddingHorizontal: 24,
    gap: 10,
  },
  suggestionButton: {
    backgroundColor: '#FFCB45',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  suggestionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  typingContainer: {
    paddingHorizontal: 15,
  },
});