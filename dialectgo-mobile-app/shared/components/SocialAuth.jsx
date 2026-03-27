import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import googleLogo from '@assets/logo/googleLogo.png';
import facebookLogo from '@assets/logo/facebookLogo.jpg';

export default function SocialAuth() {
  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.text}>Or continue with</Text>
        <View style={styles.line} />
      </View>
      
      <View style={styles.buttonRow}>
        <IconButton 
          icon={() => <Image source={googleLogo} style={styles.icon} />} 
          style={styles.socialBtn} mode="contained" containerColor="#F2F2F2" 
        />
        <IconButton 
          icon={() => <Image source={facebookLogo} style={styles.icon} />} 
          style={styles.socialBtn} mode="contained" containerColor="#F2F2F2" 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#999' },
  text: { mx: 10, color: '#666' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 15 },
  socialBtn: { width: 60, height: 50, borderRadius: 10 },
  icon: { width: 25, height: 25 },
});