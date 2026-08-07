import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { styles } from '../../../shared/styles/ChatInterfaceStyles';
import ProfileTopBar from '../../../shared/components/ProfileTopBar';
import ChatBubble from './ChatBubble';

// ==========================
// GEMINI CONFIG
// ==========================
const GEMINI_API_KEY = 'AIzaSyD-zAGkmdmdTb5D41LofOhXps0nunju70U';

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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
`;

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
  subtext:
    'I can help you translate Cebuano, Tagalog, and English.',
};

export default function Learn() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  // conversation history for Gemini
  const chatHistory = useRef([]);

  // ==========================
  // SEND MESSAGE
  // ==========================
  const sendMessage = async (customText = null) => {
    const messageText = customText || inputText;

    if (!messageText.trim()) return;

    // user message
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    // save conversation history
    chatHistory.current.push({
      role: 'user',
      parts: [{ text: messageText }],
    });

    try {
      console.log('3️⃣ Fetching Gemini...');

      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\nUser: ${messageText}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        }),
      });
      

      const data = await response.json();

      console.log(
        'FULL GEMINI RESPONSE:',
        JSON.stringify(data, null, 2)
      );

      // HANDLE API ERRORS
      if (data.error) {
        throw new Error(data.error.message);
      }

      // EXTRACT TEXT
      const botReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      // HANDLE EMPTY RESPONSE
      if (!botReply) {
        throw new Error('Gemini returned empty response');
      }

      // SAVE HISTORY
      chatHistory.current.push({
        role: 'model',
        parts: [{ text: botReply }],
      });

      // SHOW MESSAGE
      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply.trim(),
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.log('GEMINI ERROR:', error);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `Error: ${error.message}`,
        },
      ]);
    }

  // ==========================
  // RENDER
  // ==========================

    finally {
    setLoading(false);
  }
  };
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* TOP BAR */}
      <ProfileTopBar title="DialectBot" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* CHAT AREA */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble message={item} />
          )}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* SUGGESTION CHIPS */}
        {messages.length <= 1 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => sendMessage(item)}
              >
                <Text style={styles.chipText}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* TYPING */}
        {loading && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingBottom: 10,
            }}
          >
            <ActivityIndicator size="small" color="#FFCB45" />
            <Text style={{ marginLeft: 10 }}>
              DialectBot is typing...
            </Text>
          </View>
        )}

        {/* INPUT BAR */}
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

