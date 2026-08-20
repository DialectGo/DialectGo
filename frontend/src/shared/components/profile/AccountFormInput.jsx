import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function AccountFormInput({ label, value, onChangeText, placeholder, editable = true }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput 
        style={styles.textInput} 
        value={value} 
        onChangeText={onChangeText} 
        placeholder={placeholder}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#BDBDBD',
    marginBottom: 8,
    marginLeft: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: '#F0F2F5',
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2D1606',
    fontFamily: 'Poppins-Medium',
    textAlign: 'left', 
  },
});
