import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useProfileNetwork = () => {
  const [isConnected, setIsConnected] = useState(true);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  return { isConnected };
};
