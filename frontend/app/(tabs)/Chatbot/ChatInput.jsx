import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Surface, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ChatInput({ onSend }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <Surface style={styles.footer} elevation={4}>
      <View style={styles.inputRow}>
        {/* <IconButton icon="microphone" size={24} iconColor="black" style={styles.sideIcon} />
        <IconButton icon="camera-outline" size={24} iconColor="black" style={styles.sideIcon} /> */}
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your message..."
            value={text}
            onChangeText={setText}
            style={styles.textInput}
          />
        </View>

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <MaterialCommunityIcons name="chevron-right" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 10,
    backgroundColor: '#D9D9D9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sideIcon: { backgroundColor: '#FFCB45', margin: 4 },
  inputContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    marginHorizontal: 5,
    paddingHorizontal: 15,
    height: 45,
    justifyContent: 'center',
  },
  textInput: { fontSize: 14, color: '#333' },
  sendBtn: {
    backgroundColor: '#FFCB45',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
});