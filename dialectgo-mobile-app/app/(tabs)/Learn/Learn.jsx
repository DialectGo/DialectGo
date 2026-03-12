import React, { useState, useRef } from 'react';
import { StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

export default function Learn() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: "Kumusta! I'm DialectBot!",
      subtext: "I can help you Cebuano, Tagalog, and English translations, pronunciation, or practice conversation.\nWhat would you like to learn today?",
    },
  ]);

  const flatListRef = useRef(null);

  const sendMessage = (text) => {
    const newUserMsg = { id: Date.now().toString(), sender: 'user', text };
    setMessages((prev) => [...prev, newUserMsg]);
    
    // Mock bot response logic
    setTimeout(() => {
      const botReply = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '"Daghang Salamat"',
        subtext: "Salamat — standard, used in most situations.\nSalamat kaayo — very grateful.",
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatInput onSend={sendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  listContent: { paddingHorizontal: 15, paddingVertical: 20, paddingBottom: 100 },
});