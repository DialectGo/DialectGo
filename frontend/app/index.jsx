import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { supabase } from '../shared/lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#FBBF24' }}>
        <ActivityIndicator color="#000" size="large" />
      </View>
    );
  }

  return session ? <Redirect href="/(tabs)/Home" /> : <Redirect href="/login" />;
}