import React from 'react';
import { TextInput } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export default function AuthInput({ label, value, onChangeText, secureTextEntry, keyboardType }) {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      mode="outlined"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      outlineColor="#ccc"
      activeOutlineColor="#FBBF24"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 12, backgroundColor: '#fff' },
});