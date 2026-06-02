import React, { useCallback, useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Modal, 
  SafeAreaView, 
  StatusBar, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../WordBridge/WordBridgeStyles';
import { supabase } from '../../../../shared/lib/supabase';

import { API_API_BASE } from '../../../../shared/config/apiConfig';
const API_URL = API_API_BASE;
const HEART_XP_COST = 50; 
const MAX_HEARTS = 8;
const REGEN_RATE_MS = 60 * 60 * 1000; // 1 Hour in milliseconds

export default function WordBridgeGame() {
  const router = useRouter(); 
  const params = useLocalSearchParams();
  
  // Game Configuration Parameters
  const [level, setLevel] = useState(parseInt(params.initialLevel) || 1);
  const gameMode = params.gameMode || 'Cebuano - English'; 
  const sessionId = params.sessionId;

  const gameDifficulty = 'hard'; 
  const displayLanguagePool = params.targetLanguage || (gameMode.toLowerCase().includes('tagalog') ? 'tagalog' : 'english');

  // Game Engine State
  const [loading, setLoading] = useState(true);
  const [globalHearts, setGlobalHearts] = useState(8); 
  const [currentScore, setCurrentScore] = useState(0); 
  const [totalXpPool, setTotalXpPool] = useState(0); 
  const [totalQuestionsInLevel, setTotalQuestionsInLevel] = useState(4);
  
  const [challengeBank, setChallengeBank] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]); 
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [activeTargetLanguage, setActiveTargetLanguage] = useState(params.targetLanguage || 'english');

  // Scrambled Sentence Assembly Blocks
  const [scrambledTokens, setScrambledTokens] = useState([]);
  const [constructedTokens, setConstructedTokens] = useState([]);

  // Modals & Popups
  const [isPaused, setIsPaused] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState(null); 
  const [buyingHearts, setBuyingHearts] = useState(false); 
  const [lastHeartConsumedAt, setLastHeartConsumedAt] = useState(null); // ✅ Added real-time timestamp tracking

  const progressPercent = (currentScore / totalQuestionsInLevel) * 100;

  // ✅ Loads centralized tracking states and server timestamps safely
  const fetchGameChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert("Authentication Required", "Please log in again to sync translation assets.");
        router.back();
        return;
      }

      // Fetch unified tracking data straight from backend calculations engine
      const progressRes = await fetch(`${API_URL}/progress/me`, { 
        headers: { 'Authorization': `Bearer ${session.access_token}` } 
      });
      const progressResult = await progressRes.json();
      
      if (progressResult.success && progressResult.data) {
        const backendHearts = progressResult.data.current_hearts ?? MAX_HEARTS;
        setGlobalHearts(backendHearts);
        setTotalXpPool(progressResult.data.total_xp || 0);
        setLastHeartConsumedAt(progressResult.data.last_heart_consumed_at);
        
        // Match cache to client tracking immediately
        await AsyncStorage.setItem('@central_hearts', backendHearts.toString());
      }

      const requestedLang = params.targetLanguage || (gameMode.toLowerCase().includes('tagalog') ? 'tagalog' : 'english');
      const url = `${API_URL}/games/1/challenges?difficulty=${gameDifficulty}&level=${level}&targetLanguage=${requestedLang}`;
      
      const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        const sampleText = result.data[0].translation_term.toLowerCase();
        const containsEnglish = /\b(the|is|child|runs|very|his|her|with|good|dog|cat|house)\b/.test(sampleText);
        
        if (containsEnglish) {
          setActiveTargetLanguage('english');
        } else {
          setActiveTargetLanguage('tagalog');
        }

        setChallengeBank(result.data);
        setupLevelData(result.data);
      } else {
        Alert.alert("Asset Error", "Could not load enough sentence assets for this game mode.");
        router.back();
      }
    } catch (e) {
      console.error("Error fetching word bridge content:", e);
      Alert.alert("Network Error", "Could not synchronize with game asset servers.");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [level, gameDifficulty, gameMode, params.targetLanguage]);

  // ✅ Foreground background recovery processing hook
  useEffect(() => {
    if (globalHearts >= MAX_HEARTS || !lastHeartConsumedAt) return;

    const interval = setInterval(async () => {
      const elapsed = new Date().getTime() - new Date(lastHeartConsumedAt).getTime();
      
      if (elapsed >= REGEN_RATE_MS) {
        const heartsToIncrease = Math.floor(elapsed / REGEN_RATE_MS);
        const updatedHeartsCount = Math.min(MAX_HEARTS, globalHearts + heartsToIncrease);
        
        setGlobalHearts(updatedHeartsCount);
        await AsyncStorage.setItem('@central_hearts', updatedHeartsCount.toString());
        
        if (updatedHeartsCount === MAX_HEARTS) {
          setLastHeartConsumedAt(null);
        } else {
          setLastHeartConsumedAt(new Date(new Date(lastHeartConsumedAt).getTime() + (heartsToIncrease * REGEN_RATE_MS)).toISOString());
        }
      }
    }, 30000); // Check updates every 30 seconds

    return () => clearInterval(interval);
  }, [globalHearts, lastHeartConsumedAt]);

  // ✅ Core transactional method to buy hearts using accumulated XP points
  const handlePurchaseHearts = async () => {
    if (totalXpPool < HEART_XP_COST) {
      Alert.alert("Insufficient XP", `Kailangan mo ng hindi bababa sa ${HEART_XP_COST} XP para makabili ng bagong Hearts.`);
      return;
    }

    try {
      setBuyingHearts(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${API_URL}/progress/buy-hearts`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ xp_cost: HEART_XP_COST })
      });
      const result = await response.json();

      if (result.success) {
        setGlobalHearts(MAX_HEARTS);
        await AsyncStorage.setItem('@central_hearts', MAX_HEARTS.toString());
        setTotalXpPool(prev => prev - HEART_XP_COST);
        setLastHeartConsumedAt(null);
        setResultType(null);
        setShowResultModal(false);
        Alert.alert("Refill Successful", "Ang iyong mga puso ay ganap nang na-refill! ❤️");
      }
    } catch (error) {
      console.error("Heart store backend interaction failed:", error);
      Alert.alert("Transaction Failed", "Pakisubukang muli mamaya.");
    } finally {
      setBuyingHearts(false);
    }
  };

  const setupLevelData = (bank) => {
    const numQuestions = Math.min(3 + level, bank.length);
    setTotalQuestionsInLevel(numQuestions);
    
    const shuffled = [...bank].sort(() => 0.5 - Math.random()).slice(0, numQuestions);
    setCurrentScore(0);
    if (shuffled.length > 0) {
      generateQuestion(shuffled[0], shuffled.slice(1));
    }
  };

  const generateQuestion = (nextQ, remainingList) => {
    if (!nextQ) return; 

    setCurrentQuestion(nextQ);
    setAvailableQuestions(remainingList);
    setConstructedTokens([]);

    const rawTokens = nextQ.translation_term.split(/\s+/);
    const shuffledTokens = rawTokens
      .map((word, index) => ({ id: index, word }))
      .sort(() => 0.5 - Math.random());

    setScrambledTokens(shuffledTokens);
  };

  useEffect(() => {
    fetchGameChallenges();
  }, [fetchGameChallenges]);

  const handleTokenPress = (token, source) => {
    if (showResultModal || isPaused) return;

    if (source === 'scrambled') {
      setScrambledTokens(prev => prev.filter(t => t.id !== token.id));
      setConstructedTokens(prev => [...prev, token]);
    } else {
      setConstructedTokens(prev => prev.filter(t => t.id !== token.id));
      setScrambledTokens(prev => [...prev, token].sort(() => 0.5 - Math.random()));
    }
  };

  const checkSentenceBridge = async () => {
    if (!currentQuestion) return;

    const currentGuess = constructedTokens.map(t => t.word).join(' ');
    const isCorrect = currentGuess.trim() === currentQuestion.translation_term.trim();

    if (isCorrect) {
        const nextScore = currentScore + 1;
        setCurrentScore(nextScore);

        if (nextScore >= totalQuestionsInLevel) {
          await handleLevelComplete(nextScore); 
          setResultType('win');
          setShowResultModal(true);
        } else if (availableQuestions.length > 0) {
          generateQuestion(availableQuestions[0], availableQuestions.slice(1));
        }
    } else {
        const newHearts = Math.max(0, globalHearts - 1);
        setGlobalHearts(newHearts);
        await AsyncStorage.setItem('@central_hearts', newHearts.toString()); 
        
        // ✅ Synchronize manual logic heart loss events right to remote tables
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const syncHeartRes = await fetch(`${API_URL}/progress/lose-heart`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ current_hearts: globalHearts })
          });
          const syncResult = await syncHeartRes.json();
          if (syncResult.success) {
            setLastHeartConsumedAt(syncResult.data.last_heart_consumed_at);
          }
        } catch (err) {
          console.error("Failed to sync structural heart loss timestamp:", err);
        }

        if (newHearts <= 0) {
          setResultType('lose');
          setShowResultModal(true);
        } else {
          Alert.alert("Bridge Collapsed!", "The words are out of order. Check your syntax and try again!");
        }
    }
  };

  const handleLevelComplete = async (finalLevelScore) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const savedLevels = await AsyncStorage.getItem(`completed_levels_${gameDifficulty}`);
      let levelsArray = savedLevels ? JSON.parse(savedLevels) : [];
      
      if (!levelsArray.includes(level)) {
        levelsArray.push(level);
        await AsyncStorage.setItem(`completed_levels_${gameDifficulty}`, JSON.stringify(levelsArray));
      }

      const accuracy = (finalLevelScore / totalQuestionsInLevel) * 100;
      await fetch(`${API_URL}/sessions/${params.sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          accuracy_score: accuracy,
          session_data: { level, difficulty: gameDifficulty }
        })
      });

      const xpGained = 30; 
      const pointsCalculated = finalLevelScore * 15; 

      await fetch(`${API_URL}/progress/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          xp_gained: xpGained,
          score_gained: pointsCalculated 
        })
      });

    } catch (e) {
      console.error("Error synchronizing WordBridge level stats to DB:", e);
    }
  };

  const handleQuit = () => {
    setIsPaused(false);
    setShowResultModal(false);
    router.back();
  };

  if (loading) return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color="#FF9800" />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFDF9' }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* --- HUD HEADER --- */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => setIsPaused(true)}>
          <Ionicons name="pause-circle" size={45} color="#421C00" />
        </TouchableOpacity>
        
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontWeight: '900', fontSize: 12, color: '#421C00' }}>LEVEL {level}</Text>
            <Text style={{ fontWeight: '900', fontSize: 12, color: '#421C00' }}>{currentScore}/{totalQuestionsInLevel}</Text>
          </View>
          <View style={{ height: 10, backgroundColor: '#E0E0E0', borderRadius: 5, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: '#FF9800', width: `${progressPercent}%` }} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 2, borderColor: '#FF9800' }}>
          <Ionicons name="heart" size={20} color="#F44336" />
          <Text style={{ marginLeft: 5, fontWeight: '900', color: '#421C00', fontSize: 14 }}>{globalHearts}</Text>
        </View>
      </View>

      {/* --- SOURCE PROMPT CARD --- */}
      <View style={{ paddingHorizontal: 25, marginTop: 30 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: '#78909C', marginBottom: 8, textTransform: 'uppercase' }}>
          Translate to {activeTargetLanguage.charAt(0).toUpperCase() + activeTargetLanguage.slice(1)}:
        </Text>
        <View style={{ backgroundColor: '#FFF', padding: 25, borderRadius: 25, borderWidth: 2, borderColor: '#FFE082', elevation: 2 }}>
          <Text style={{ fontSize: 20, color: '#421C00', fontWeight: 'bold', textAlign: 'center', lineHeight: 28 }}>
            {currentQuestion?.display_text}
          </Text>
        </View>
      </View>

      {/* --- CONSTRUCTION TRACK / THE TULAY --- */}
      <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center', marginVertical: 20 }}>
        <Text style={{ textAlign: 'center', color: '#B0BEC5', fontWeight: 'bold', marginBottom: 10 }}>YOUR WORD BRIDGE</Text>
        <View style={{ minHeight: 120, backgroundColor: '#EFE6C9', borderRadius: 25, padding: 15, flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#D7CCC8', borderStyle: 'dashed' }}>
          {constructedTokens.map((token) => (
            <TouchableOpacity 
              key={token.id} 
              style={{ backgroundColor: '#FF9800', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 15, borderBottomWidth: 3, borderBottomColor: '#E65100' }}
              onPress={() => handleTokenPress(token, 'constructed')}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>{token.word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* --- SCRAMBLED WORDS BOARD --- */}
      <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, borderWidth: 2, borderColor: '#FFE082', minHeight: 220 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
          {scrambledTokens.map((token) => (
            <TouchableOpacity 
              key={token.id} 
              style={{ backgroundColor: '#FFF8E1', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 18, borderWidth: 2, borderColor: '#FFE082' }}
              onPress={() => handleTokenPress(token, 'scrambled')}
            >
              <Text style={{ color: '#421C00', fontWeight: '700', fontSize: 16 }}>{token.word}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- VALIDATION ACTIONS --- */}
        <TouchableOpacity 
          disabled={constructedTokens.length === 0}
          style={[
            styles.mainButton, 
            { backgroundColor: '#4CAF50', height: 55, width: '100%', opacity: constructedTokens.length === 0 ? 0.5 : 1 }
          ]} 
          onPress={checkSentenceBridge}
        >
          <Ionicons name="checkmark-circle" size={24} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>TEST BRIDGE CONNECTIONS</Text>
        </TouchableOpacity>
      </View>

      {/* --- PAUSE MODAL --- */}
      <Modal transparent visible={isPaused} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>GAME PAUSED</Text>
            <TouchableOpacity style={[styles.mainButton, { backgroundColor: '#FF9800' }]} onPress={() => setIsPaused(false)}>
              <Ionicons name="play" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleQuit}>
              <Text style={styles.secondaryButtonText}>QUIT GAME</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- RESULT / LOSS STORE MODAL --- */}
      <Modal transparent visible={showResultModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons 
              name={resultType === 'win' ? "trophy" : "heart-dislike"} 
              size={80} 
              color={resultType === 'win' ? "#FFD54F" : "#D32F2F"} 
            />
            <Text style={styles.modalTitle}>
              {resultType === 'win' ? "LEVEL COMPLETE!" : "NO MORE HEARTS"}
            </Text>
            
            {resultType === 'win' ? (
              <TouchableOpacity 
                style={styles.mainButton} 
                onPress={() => {
                  setShowResultModal(false);
                  setLevel(prev => prev + 1); 
                }}
              >
                <Text style={styles.buttonText}>NEXT LEVEL</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', marginBottom: 15, paddingHorizontal: 10 }}>
                  Naubusan ka ng buhay! Maaari kang bumili ng buong refill gamit ang iyong XP.
                </Text>
                
                <TouchableOpacity 
                  style={[styles.mainButton, { backgroundColor: '#FF9800', marginBottom: 10 }]} 
                  onPress={handlePurchaseHearts}
                  disabled={buyingHearts}
                >
                  {buyingHearts ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>BUY REFILL ({HEART_XP_COST} XP)</Text>
                  )}
                </TouchableOpacity>
                <Text style={{ fontSize: 11, color: '#777', marginBottom: 15 }}>Current Balance: {totalXpPool} XP</Text>
              </View>
            )}

            <TouchableOpacity style={styles.secondaryButton} onPress={handleQuit}>
              <Text style={styles.secondaryButtonText}>EXIT TO MENU</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}