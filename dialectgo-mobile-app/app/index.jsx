import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Text, Button, Card, Avatar, TextInput, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import googleLogo from '@assets/logo/googleLogo.png';
import facebookLogo from '@assets/logo/facebookLogo.jpg';

export default function Login() {
    const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-[#FBBF24] pb-0" edges={['top']}>
       <View className="px-6 py-2 pb-14">
          <Text variant="headlineMedium" className="text-slate-800 font-bold-100">
            Maayong Pagbalik!
          </Text>
          <Text variant="labelMedium" className="text-[8px] text-gray-700 ml-2">
            Translate Cebuano, Connect Everywhere.
          </Text>
      </View>
        <View className="flex-1 justify-end"> 
          <View className="h-full w-full bg-[#D9D9D9] rounded-t-[45px] px-6 pt-14 pb-12 shadow-lg">
            <View className="px-6 py-2">
                <Text variant="headlineLarge" className="text-slate-800 p-5">
                  LOG IN
                </Text>
            </View>

              <View>
                <TextInput
                  style={styles.input}
                  label="Email"
                  mode="outlined"
                  placeholder="Email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                />

                <TextInput
                  label="Password"
                  mode="outlined"
                  style={styles.input}
                />
              </View>
              <View className="px-6 items-end pb-0">
                <View className="flex-row">
                  <Button mode="text" style={{ marginTop: 0, borderRadius: 10 }} textColor="#000000">
                    Forgot Password?
                </Button>
                </View>
              </View>

              <View style={styles.actions} className="pb-2">
                <Button mode="contained" style={{ marginTop: 16, borderRadius: 10 }} buttonColor="#F2F2F2" textColor="#000000" className="p-2" onPress={() => router.push('/(tabs)/Home')}>
                  LOG IN
                </Button>

                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-[1px] bg-gray-500" />
                  <Text className="mx-4 text-gray-500 font-medium">Or continue with</Text>
                  <View className="flex-1 h-[1px] bg-gray-500" />
                </View>
              </View>

              <View className="flex-row items-center justify-center my-2">
                <IconButton
                    icon={({ size }) => (
                      <Image source={googleLogo} style={{ width: 30, height: 30 }} resizeMode="contain" />
                    )}
                    size={30}
                    mode="contained"
                    containerColor="#F2F2F2"
                    style={{ marginTop: 16, borderRadius: 10, width: 60, height: 50 }}
                    onPress={() => {}}
                />
                  <Text className="mx-4 text-gray-500 font-medium"> </Text>
                <IconButton
                    icon={({ size }) => (
                      <Image source={facebookLogo} style={{ width: 30, height: 30 }} resizeMode="contain" />
                    )}
                    size={30}
                    mode="contained"
                    containerColor="#F2F2F2"
                    style={{ marginTop: 16, borderRadius: 10, width: 60, height: 50 }} 
                    onPress={() => {}}
                />
              </View>
              <View className="flex-row items-center justify-center my-2">
                <Text mode="text" style={{ marginTop: 16, borderRadius: 10}} textColor="#000000">
                  Don't have an account?
                </Text>
                <Button mode="text" style={{ marginTop: 16, borderRadius: 10 }} textColor="#000000" onPress={() => router.push('/auth/Register')}>
                  Sign Up
                </Button>
              </View>
          </View>
        </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FDCE4A',
  },
  card: {
    paddingVertical: 8,
    padding: 16,
    elevation: 4,
  },
  input: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
  },
  loginBtn: {
    marginTop: 8,
  },
  footer: {
    marginTop: 16,
  }
});