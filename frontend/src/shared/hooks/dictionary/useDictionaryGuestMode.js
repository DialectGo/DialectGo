import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../api/supabase';

export const useDictionaryGuestMode = () => {
    const [isGuestMode, setIsGuestMode] = useState(false);
    const [isConnected, setIsConnected] = useState(true);

    const checkGuestMode = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsGuestMode(false);
                return;
            }

            const role = await AsyncStorage.getItem('@user_role');
            const guestMode = await AsyncStorage.getItem('@guest_mode');
            
            const isGuest = role === 'guest' || guestMode !== null;
            setIsGuestMode(isGuest);
        } catch (error) {
            console.log('Guest mode check error:', error);
            setIsGuestMode(true);
        }
    };

    useEffect(() => {
        checkGuestMode();
        
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = state.isConnected ?? false;
            setIsConnected(connected);

            if (!connected) {
                setIsGuestMode(true);
            } else {
                checkGuestMode();
            }
        });

        return () => unsubscribe();
    }, []);

    return {
        isGuestMode,
        setIsGuestMode,
        isConnected,
        checkGuestMode,
    };
};
