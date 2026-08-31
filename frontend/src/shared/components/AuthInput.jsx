import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

export default function AuthInput({ label, value, onChangeText, secureTextEntry, keyboardType, style, maxLength }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // If the prop says it should be secure, but the user toggled visibility, we hide/show accordingly.
  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={styles.bottomSpace} className="w-full mb-4"> 
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
        keyboardType={keyboardType}
        maxLength={maxLength}
        mode="outlined"
        outlineColor="transparent"
        activeOutlineColor="#FFBC00"
        placeholderTextColor="#FFBC00"
        outlineStyle={style} 
        style={{ backgroundColor: 'transparent' }} 
        contentStyle={{ justifyContent: 'center', alignItems: 'center', marginTop: 5, fontWeight: '600', paddingHorizontal: 20 }}
        right={
          secureTextEntry ? (
            <TextInput.Icon 
              icon={isPasswordVisible ? "eye-off" : "eye"} 
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              color="#A58D80" // DialectGo textHint color
              forceTextInputFocus={false}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSpace: {
    marginBottom: 20,
  }
});