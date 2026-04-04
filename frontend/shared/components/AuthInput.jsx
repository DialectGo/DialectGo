import React from 'react';
import { TextInput } from 'react-native-paper';
import { View, StyleSheet} from 'react-native';

export default function AuthInput({ label, value, onChangeText, secureTextEntry, keyboardType, style }) {
  return (
    <View style= {styles.bottomSpace} className="w-full mb-4"> 
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        mode="outlined"
        outlineColor="transparent"
        activeOutlineColor="#FFBC00"
        placeholderTextColor="#FFBC00"
        outlineStyle={style} 
        style={{ backgroundColor: 'transparent' }} 
        contentStyle={{ justifyContent: 'center', alignItems: 'center', marginTop: 5, fontWeight: '600', paddingHorizontal: 20 }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  bottomSpace: {
    marginBottom: 20,
  }});