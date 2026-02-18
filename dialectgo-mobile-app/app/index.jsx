import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Text, Button, Card, Avatar, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  // const [secureText, setSecureText] = useState(true);
  // const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FBBF24] pb-0" edges={['top']}>
       <View className="px-6 py-2 pb-14">
          <Text variant="headlineMedium" className="text-slate-800">
            Maayong Pagbalik!
          </Text>
          <Text variant="labelMedium" className="text-[8px] text-gray-700 ml-2">
            Translate Cebuano, Connect Everywhere.
          </Text>
      </View>
        <View className="flex-1 justify-end"> 
          <View className="h-full w-full bg-[#D9D9D9] rounded-t-[45px] px-6 pt-14 pb-12 shadow-lg">
            <View className="px-6 py-2">
                <Text variant="headlineMedium" className="text-slate-800">
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
              <View className="px-6 items-end pb-10">
                <View className="flex-row px-4 py-1.5">
                  <Text className="text-[12px] text-gray-700 ml-2">
                    <Text className="font-bold">Forgot Password? </Text>
                  </Text>
                </View>
              </View>

              <View style={styles.actions} className="pb-2">
                <Button mode="contained" style={{ marginTop: 16, borderRadius: 10 }} buttonColor="#F2F2F2" textColor="#000000">
                  LOG IN
                </Button>

                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-[1px] bg-gray-500" />
                  <Text className="mx-4 text-gray-500 font-medium">Or continue with</Text>
                  <View className="flex-1 h-[1px] bg-gray-500" />
                </View>
              </View>
              <View className="flex-row items-center justify-center my-6">
                <Button mode="contained" style={{ marginTop: 16, borderRadius: 10 }} buttonColor="#F2F2F2" textColor="#000000">
                  GOOGLE
                </Button>
                  <Text className="mx-4 text-gray-500 font-medium"> </Text>
                <Button mode="contained" style={{ marginTop: 16, borderRadius: 10 }} buttonColor="#F2F2F2" textColor="#000000">
                  FACEBOOK
                </Button>
              </View>
              <View className="flex-row items-center justify-center my-6">
                <Button mode="text" style={styles.footer} onPress={() => {}}>
                  Don't have an account?
                </Button>
                <Text className="mx-4 text-gray-500 font-medium">Sign Up</Text>
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
    marginBottom: 12,
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