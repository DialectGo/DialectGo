import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { styles } from '../../../shared/styles/ChatInterfaceStyles';
import ChatBubble from './ChatBubble';
import ProfileTopBar from '../../../shared/components/ProfileTopBar';

// ==========================
// GROQ CONFIG
// ==========================
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY; // ✅ Use env variable for API key
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `
You are DialectBot, a friendly Filipino language learning assistant for the DialectGo app.

You help users with:
- Cebuano translations
- Tagalog translations
- English translations
- Pronunciation
- Conversation practice
- Navigation inside the DialectGo app

Rules:
- Be friendly
- Keep responses concise
- Explain clearly
- Use examples when needed
- Avoid markdown
`.trim();

// ==========================
// SUGGESTIONS
// ==========================
const suggestions = [
  'How to change name?',
  'Do you have other games?',
  'How to use Dictionary?',
  'How can I translate?',
];

// ==========================
// INITIAL MESSAGE
// ==========================
const INITIAL_MESSAGE = {
  id: '1',
  sender: 'bot',
  text: "Kumusta! I'm DialectBot 👋",
  subtext: 'I can help you translate Cebuano, Tagalog, and English.',
};

export default function Learn() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef(null);
  const chatHistory = useRef([]); // [{ role: 'user'|'assistant', content: string }]

  // ==========================
  // SEND MESSAGE
  // ==========================
  const sendMessage = async (customText = null) => {
    const messageText = customText || inputText;
    if (!messageText.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    chatHistory.current.push({
      role: 'user',
      content: messageText,
    });

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 300,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...chatHistory.current,
          ],
        }),
      });

      const data = await response.json();

      console.log('FULL GROQ RESPONSE:', JSON.stringify(data, null, 2));

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      const botReply = data?.choices?.[0]?.message?.content;

      if (!botReply) {
        throw new Error('Groq returned an empty response');
      }

      chatHistory.current.push({
        role: 'assistant',
        content: botReply,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botReply.trim(),
        },
      ]);

    } catch (error) {
      console.log('GROQ ERROR:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `Error: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfileTopBar title="DialectBot" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {messages.length <= 1 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => sendMessage(item)}
              >
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading && (
          <View style={{ flexDirection: 'row', padding: 10 }}>
            <ActivityIndicator size="small" color="#FFCB45" />
            <Text style={{ marginLeft: 10 }}>DialectBot is typing...</Text>
          </View>
        )}

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => sendMessage()}
            disabled={loading}
          >
            <Image
              source={require('../../../assets/icons/sendButton.png')}
              style={styles.sendIcon}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 