import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, Card, Avatar, TextInput } from 'react-native-paper';

const Login = () => {
  // 1. State for user input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        {/* 2. Header Icon and Title */}
        <Card.Title 
          title="DialectGo" 
          subtitle="Login to continue" 
          left={(props) => <Avatar.Icon {...props} icon="lock" />} 
        />

        <Card.Content>
          {/* 3. Email Input */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={text => setEmail(text)}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />

          {/* 4. Password Input with Toggle Visibility */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={text => setPassword(text)}
            mode="outlined"
            secureTextEntry={secureText}
            style={styles.input}
            left={<TextInput.Icon icon="key" />}
            right={
              <TextInput.Icon 
                icon={secureText ? "eye" : "eye-off"} 
                onPress={() => setSecureText(!secureText)} 
              />
            }
          />
        </Card.Content>

        <Card.Actions style={styles.actions}>
          {/* 5. Action Buttons */}
          <Button mode="text" onPress={() => {}}>
            Forgot Password?
          </Button>
          <Button 
            mode="contained" 
            onPress={() => console.log('Login Pressed')}
            style={styles.loginBtn}
          >
            Login
          </Button>
        </Card.Actions>
      </Card>

      <Button mode="text" style={styles.footer} onPress={() => {}}>
        Don't have an account? Sign Up
      </Button>
    </View>
  );
}

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f6f6f6',
  },
  card: {
    paddingVertical: 8,
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