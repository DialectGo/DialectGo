import React, { useState } from 'react';
import { View, Image, Dimensions, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate, Extrapolate } from 'react-native-reanimated';
import { GestureDetector, Gesture, ScrollView } from 'react-native-gesture-handler';
import { supabase } from '../../shared/lib/supabase';
import AuthInput from '../../shared/components/AuthInput';
import SocialAuth from '../../shared/components/SocialAuth';
import CustomButton from '../../shared/components/CustomButton';

const { height, width } = Dimensions.get('window');

const SNAP_TOP = height * 0.05;    
const SNAP_BOTTOM = height * 0.25; 
const DRAG_LOWER_LIMIT = SNAP_BOTTOM + 50;

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({ 
    firstName: '', lastName: '', email: '', age: '', password: '', confirmPassword: '' 
  });

  const translateY = useSharedValue(SNAP_BOTTOM);
  const contextY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      let nextValue = contextY.value + event.translationY;
      if (nextValue < SNAP_TOP) nextValue = SNAP_TOP;
      if (nextValue > DRAG_LOWER_LIMIT) nextValue = DRAG_LOWER_LIMIT;
      translateY.value = nextValue;
    })
    .onEnd((event) => {
      const halfwayPoint = (SNAP_BOTTOM + SNAP_TOP) / 2;
      if (event.velocityY < -500 || translateY.value < halfwayPoint) {
        translateY.value = withSpring(SNAP_TOP, { damping: 18, stiffness: 100 });
      } else {
        translateY.value = withSpring(SNAP_BOTTOM, { damping: 18, stiffness: 100 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SNAP_TOP + 100, SNAP_BOTTOM],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const handleSignUp = async () => {
    if (!agree) return Alert.alert("Required", "Please agree to the Terms and Agreement");
    if (form.password !== form.confirmPassword) return Alert.alert("Error", "Passwords do not match");
    
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email: form.email, 
      password: form.password,
      options: {
        data: { first_name: form.firstName, last_name: form.lastName, age: form.age }
      }
    });
    setLoading(false);

    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Success", "Account created! Please log in.");
      router.replace('/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      
      <Animated.View style={[styles.headerContainer, headerStyle]} className="w-full px-10 pt-10">
        <Text style={styles.greetingText} className="text-[#FFBC00] text-amber-400 text-4xl font-black tracking-tighter">
            Maayong pagbalik!
        </Text>
        <Text className="text-slate-500 text-base font-bold mt-1">
            Learn More. Speak Better. Connect Easier.
        </Text>
        <Image 
          source={require('@assets/logo/Logo.png')} 
          className="w-64 h-32 self-end mt-4 mr-[-20]"
          resizeMode="contain" 
        />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.formCard, cardStyle]}>
          <View className="items-center py-4">
            <View className="w-12 h-1.5 bg-slate-400 rounded-full" />
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 40, paddingBottom: 120 }}
            simultaneousHandlers={panGesture} 
          >
            <Text className="text-center text-5xl font-black text-[#2D2D2D] mb-8 tracking-tighter">
              SIGN UP
            </Text>

            <View className="space-y-1">
              <View className="flex-row justify-between w-full">
                <View className="w-[48%]">
                  <AuthInput label="First Name" onChangeText={(v) => setForm({...form, firstName: v})} style={styles.authArea} />
                </View>
                <View className="w-[48%]">
                  <AuthInput label="Last Name" onChangeText={(v) => setForm({...form, lastName: v})} style={styles.authArea} />
                </View>
              </View>
              <AuthInput label="Email" keyboardType="email-address" onChangeText={(v) => setForm({...form, email: v})} style={styles.authArea} />
              <AuthInput label="Age" keyboardType="numeric" onChangeText={(v) => setForm({...form, age: v})} style={styles.authArea} />
              <AuthInput label="Password" secureTextEntry onChangeText={(v) => setForm({...form, password: v})} style={styles.authArea} />
              <AuthInput label="Confirm Password" secureTextEntry onChangeText={(v) => setForm({...form, confirmPassword: v})} style={styles.authArea} />
            </View>

            <View className="flex-row items-center justify-center my-4">
              <Text className="text-slate-700 font-bold text-sm">Agree on Terms?</Text>
              <TouchableOpacity 
                 onPress={() => setAgree(!agree)}
                 className={`ml-3 w-6 h-6 rounded-md border-2 border-amber-400 ${agree ? 'bg-amber-400' : 'bg-transparent'}`}
              />
            </View>

            <CustomButton title="SIGN UP" onPress={handleSignUp} loading={loading} style={styles.signUpBtn} />
            
            <SocialAuth />

            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-700 font-bold">Have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text className="font-black underline text-black">Log In.</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 50,
  },
  greetingText: {
    color: '#FFBC00', 
    fontWeight: '900',
    fontSize: 32,
    marginBottom: 8,
  },
  formCard: {
    backgroundColor: '#FFF2C5',
    borderTopLeftRadius: 65,
    borderTopRightRadius: 65,
    height: height, 
    width: '100%',
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24, 
  },
  authArea: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    height: 60,       
    elevation: 4,
  },
  signUpBtn: {
    backgroundColor: '#FFBC00',
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
    marginTop: 10,
  }
});