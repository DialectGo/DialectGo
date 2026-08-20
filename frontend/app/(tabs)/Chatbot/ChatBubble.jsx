import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import learnIcon from '../../../assets/icons/actions/chatbotIcon1.png'; 

export default function ChatBubble({ message }) {
  const isBot = message.sender === 'bot';

  return (
    <View style={[styles.wrapper, isBot ? styles.botWrapper : styles.userWrapper]}>
      {isBot && (
        <View style={styles.avatarContainer}>
          <Surface style={styles.avatarSurface} elevation={2}>
            <Image source={learnIcon} style={styles.avatar} />
          </Surface>
        </View>
      )}
      
      <View style={isBot ? styles.botContent : styles.userContent}>
        {isBot && <Text style={styles.botName}>DialectBot</Text>}
        <Surface style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]} elevation={1}>
          <Text style={[styles.mainText, !isBot && styles.userText]}>{message.text}</Text>
          {message.subtext && <Text style={styles.subText}>{message.subtext}</Text>}
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
  botWrapper: { alignSelf: 'flex-start' },
  userWrapper: { alignSelf: 'flex-end' },
  avatarContainer: { marginRight: 10, justifyContent: 'flex-start' },
  avatarSurface: { borderRadius: 25, padding: 5, backgroundColor: '#FFCB45' },
  avatar: { width: 35, height: 35, resizeMode: 'contain' },
  botName: { fontSize: 14, fontWeight: 'bold', color: '#5D4037', marginBottom: 4, marginLeft: 5 },
  bubble: { borderRadius: 15, padding: 15 },
  botBubble: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 0 },
  userBubble: { backgroundColor: '#FFD54F', borderTopRightRadius: 0 },
  mainText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userText: { color: '#5D4037', fontWeight: '500' },
  subText: { fontSize: 13, color: '#666', marginTop: 8, fontStyle: 'italic', lineHeight: 18 },
});