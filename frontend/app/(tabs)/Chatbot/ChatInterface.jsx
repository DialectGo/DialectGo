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
import ChatBubble from './ChatBubble';
import ProfileTopBar from '../../../shared/components/ProfileTopBar';
import { endpoints } from '../../../shared/config/apiConfig';

// Import your custom JSON knowledge base file
import APP_KNOWLEDGE_BASE from '../../../assets/data/appKnowledge.json'; 

const GROQ_API_KEY = endpoints.GROQ_API_KEY; 
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const getSystemPrompt = () => {
  return `
You are DialectBot, a friendly Filipino language learning assistant for the DialectGo app.

Your primary job is to answer user inquiries about the app accurately using the official application data provided below.

[OFFICIAL APP DATA KNOWLEDGE BASE]
${JSON.stringify(APP_KNOWLEDGE_BASE, null, 2)}
[END OF KNOWLEDGE BASE]

Rules:
- Be friendly, encouraging, and polite.
- Rely ONLY on the facts present in the [OFFICIAL APP DATA KNOWLEDGE BASE] above to answer questions about app navigation, user accounts, games, or features.
- If a user asks a question about the app layout or settings that is NOT answered in the text data above, politely tell them: "Pasensya na, I don't have information on that topic yet. You can contact support for more help!"
- For language learning or trilingual translation requests (English, Tagalog, Cebuano), you are allowed to use your built-in language capabilities to fully assist them.
- Keep responses concise and clear.
- Do not use markdown syntax like asterisks (*), hashtags (#), or bullet points (-) under any circumstances.
`.trim();
};

// ==========================
// SUGGESTIONS (Fixed Bottom Chips)
// ==========================
const bottomChips = [
  '⚙️ Change Name',
  '🎮 Play Games',
  '📖 Use Dictionary',
  '🗣️ Translate Phrase',
];

// ==========================
// INITIAL MENU ITEMS (In-Chat Stack)
// ==========================
const menuQuestions = [
  'How to change name?',
  'Do you have other games?',
  'How to use Dictionary?',
  'How can I translate?',
];

// Initial message structure mimicking Shopee's setup card payload
const INITIAL_MESSAGE = {
  id: '1',
  sender: 'bot',
  text: "Kumusta! I'm DialectBot, your DialectGo virtual assistant and I'm here to help you! 👋 Select an option below to get started or start typing your inquiry in English, Tagalog, or Cebuano:",
  isWelcomeCard: true, 
};

export default function Learn() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef(null);
  const chatHistory = useRef([]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

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
    scrollToBottom();

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
            { role: 'system', content: getSystemPrompt() },
            ...chatHistory.current,
          ],
        }),
      });

      const data = await response.json();

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
      scrollToBottom();
    }
  };

  // Custom renderer for items handling Shopee's style welcome block natively
  const renderChatItem = ({ item }) => {
    if (item.isWelcomeCard) {
      return (
        <View style={{ marginBottom: 15 }}>
          {/* Main Bot Bubble */}
          <ChatBubble message={{ id: item.id, sender: item.sender, text: item.text }} />
          
          {/* Shopee-Style Vertical In-Chat Selection Menu Card */}
          <View style={{
            backgroundColor: '#FFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E8E8E8',
            marginLeft: 48, // Aligns flush directly underneath the bot bubble profile avatar 
            marginRight: 20,
            marginTop: 8,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }}>
            <View style={{ padding: 12, backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' }}>
              <Text style={{ fontWeight: '600', color: '#333', fontSize: 13 }}>You may want to ask:</Text>
            </View>
            
            {menuQuestions.map((question, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderBottomWidth: idx === menuQuestions.length - 1 ? 0 : 1,
                  borderBottomColor: '#F0F0F0',
                  backgroundColor: '#FFF',
                }}
                onPress={() => sendMessage(question)}
              >
                <Text style={{ color: '#007AFF', fontSize: 14, fontWeight: '400' }}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    return <ChatBubble message={item} />;
  };

  return (
    <View style={styles.container}>
      <ProfileTopBar title="DialectBot" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 15 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />

        {/* Shopee-style Persistent Horizontal Suggestion Chips */}
        <View style={{
          backgroundColor: '#F7F7F7',
          borderTopWidth: 1,
          borderTopColor: '#EAEAEA',
          paddingVertical: 8,
        }}>
          <FlatList
            data={bottomChips}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  backgroundColor: '#FFF',
                  borderWidth: 1,
                  borderColor: '#DCDCDC',
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  marginHorizontal: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 1,
                  elevation: 1,
                }}
                onPress={() => sendMessage(item.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim())}
              >
                <Text style={{ color: '#555', fontSize: 13, fontWeight: '500' }}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {loading && (
          <View style={{ flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, alignItems: 'center', backgroundColor: '#FFF' }}>
            <ActivityIndicator size="small" color="#FFCB45" />
            <Text style={{ marginLeft: 10, color: '#777', fontSize: 13 }}>DialectBot is typing...</Text>
          </View>
        )}

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="You may type your concern here..."
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
    </View>
  );
}