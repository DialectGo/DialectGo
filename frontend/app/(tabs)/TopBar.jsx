import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function TopBar() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.profileContainer}
          onPress={() => router.push('/Profile/Profile')}
          activeOpacity={0.7}
        >
          <Avatar.Icon 
            size={45} 
            icon="account" 
            backgroundColor="white" 
            color="black" 
            style={styles.avatarBorder}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFCB45', 
    height: 80,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginBottom: 5, 
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  spacer: {
    height: 30, 
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  profileContainer: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  avatarBorder: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  }
});