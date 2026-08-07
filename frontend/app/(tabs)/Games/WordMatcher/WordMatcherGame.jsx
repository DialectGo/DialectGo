import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal,  StatusBar, Text, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { styles } from './WordMatcherStyles';
import { supabase } from '../../../../shared/lib/supabase';

import { API_BASE_URL } from '../../../../shared/config/apiConfig';
const API_URL = `${API_BASE_URL}/api`;
const WORD_MATCHER_GAME_ID = 1;
const HEART_XP_COST = 50;
const MAX_HEARTS = 8;
const REGEN_RATE_MS = 60 * 60 * 1000; // 1 Hour in milliseconds

export default function WordMatcherGame() {
  const router = useRouter(); 
  const params = useLocalSearchParams();
  
  const [level, setLevel] = useState(parseInt(params.initialLevel) || 1);
  const [globalHearts, setGlobalHearts] = useState(8); 
  const [currentScore, setCurrentScore] = useState(0); 
  const [totalXpPool, setTotalXpPool] = useState(0); 
  const [loading, setLoading] = useState(true);
  
  const [totalQuestionsInLevel, setTotalQuestionsInLevel] = useState(4);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [choices, setChoices] = useState([]);
  const [challengeBank, setChallengeBank] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]); 
  
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  
  const [isPaused, setIsPaused] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState(null); 
  const [buyingHearts, setBuyingHearts] = useState(false);
  const [lastHeartConsumedAt, setLastHeartConsumedAt] = useState(null); // ✅ Track timestamp for tracking calculations

  const progressPercent = (currentScore / totalQuestionsInLevel) * 100;
  const gameDifficulty = params.difficulty || 'easy';
  const displayLanguagePool = params.targetLanguage || 'english';

  const getUserCacheKey = (suffix, userId = 'guest') => `wordmatcher_${suffix}_${userId}_${gameDifficulty}`;

  // ✅ Loads centralized heart metrics and server calculation timestamps safely
  const fetchGameChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert("Authentication Required", "Please re-login to download game assets.");
        router.back();
        return;
      }

      const progressRes = await fetch(`${API_URL}/progress/me?game_id=${WORD_MATCHER_GAME_ID}&difficulty=${gameDifficulty}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const progressResult = await progressRes.json();
      
      if (progressResult.success && progressResult.data) {
        const backendHearts = progressResult.data.current_hearts ?? MAX_HEARTS;
        setGlobalHearts(backendHearts);
        setTotalXpPool(progressResult.data.total_xp || 0);
        setLastHeartConsumedAt(progressResult.data.last_heart_consumed_at);
        
        await AsyncStorage.setItem(getUserCacheKey('hearts', session.user.id), backendHearts.toString());
      }

      const url = `${API_URL}/games/1/challenges?difficulty=${gameDifficulty}&level=${level}&targetLanguage=${displayLanguagePool}`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setChallengeBank(result.data);
        setupLevelData(result.data);
      } else {
        Alert.alert("Asset Error", "Could not load enough translation items for this filter mode.");
        router.back();
      }
    } catch (e) {
      console.error("Error fetching database challenges:", e);
      Alert.alert("Network Error", "Could not download game definitions.");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [level, gameDifficulty, displayLanguagePool]);

  // ✅ Foreground heart calculation interval loop
  useEffect(() => {
    if (globalHearts >= MAX_HEARTS || !lastHeartConsumedAt) return;

    const interval = setInterval(async () => {
      const elapsed = new Date().getTime() - new Date(lastHeartConsumedAt).getTime();
      
      if (elapsed >= REGEN_RATE_MS) {
        const heartsToIncrease = Math.floor(elapsed / REGEN_RATE_MS);
        const updatedHeartsCount = Math.min(MAX_HEARTS, globalHearts + heartsToIncrease);
        
        setGlobalHearts(updatedHeartsCount);
        const userId = await supabase.auth.getUser().then(({ data }) => data.user?.id || 'guest');
        await AsyncStorage.setItem(getUserCacheKey('hearts', userId), updatedHeartsCount.toString());
        
        if (updatedHeartsCount === MAX_HEARTS) {
          setLastHeartConsumedAt(null);
        } else {
          // Push anchor forward relative to recovered amounts
          setLastHeartConsumedAt(new Date(new Date(lastHeartConsumedAt).getTime() + (heartsToIncrease * REGEN_RATE_MS)).toISOString());
        }
      }
    }, 30000); // Evaluates context pools every 30 seconds smoothly

    return () => clearInterval(interval);
  }, [globalHearts, lastHeartConsumedAt]);

  // ✅ Core transactional utility to purchase hearts using XP points
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
        body: JSON.stringify({
          game_id: WORD_MATCHER_GAME_ID,
          difficulty: gameDifficulty,
          xp_cost: HEART_XP_COST,
        })
      });
      const result = await response.json();

      if (result.success) {
        setGlobalHearts(MAX_HEARTS);
        await AsyncStorage.setItem(getUserCacheKey('hearts', session.user.id), MAX_HEARTS.toString());
        setTotalXpPool(prev => prev - HEART_XP_COST);
        setLastHeartConsumedAt(null);
        setResultType(null);
        setShowResultModal(false);
        Alert.alert("Refill Successful", "Ang iyong mga puso ay ganap nang na-refill! ❤️");
      }
    } catch (error) {
      console.error("Deduction validation lifecycle failure:", error);
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
      generateQuestion(shuffled[0], shuffled.slice(1), bank);
    }
  };

  const generateQuestion = (nextQ, remainingList, fullBank) => {
    if (!nextQ) return; 
    setSelectedChoice(null);
    setIsCorrect(null);
    const distractors = fullBank
      .filter(item => item.id !== nextQ.id) 
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(item => item.translation_term); 

    setChoices([...distractors, nextQ.translation_term].sort(() => 0.5 - Math.random()));
    setCurrentQuestion(nextQ);
    setAvailableQuestions(remainingList);
  };

  useEffect(() => {
    fetchGameChallenges();
  }, [fetchGameChallenges]);

  const handleLevelComplete = async (finalLevelScore) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;
      const completedLevelsKey = `wordmatcher_completed_levels_${userId}_${gameDifficulty}`;
      const savedLevels = await AsyncStorage.getItem(completedLevelsKey);
      let levelsArray = savedLevels ? JSON.parse(savedLevels) : [];
      if (!levelsArray.includes(level)) {
        levelsArray.push(level);
        await AsyncStorage.setItem(completedLevelsKey, JSON.stringify(levelsArray));
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
          session_data: { game_id: WORD_MATCHER_GAME_ID, level, difficulty: gameDifficulty }
        })
      });

      const xpGained = gameDifficulty === 'hard' ? 30 : gameDifficulty === 'medium' ? 20 : 10;
      const pointsCalculated = finalLevelScore * (gameDifficulty === 'hard' ? 15 : gameDifficulty === 'medium' ? 10 : 5);

      const progressRes = await fetch(`${API_URL}/progress/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          game_id: WORD_MATCHER_GAME_ID,
          difficulty: gameDifficulty,
          xp_gained: xpGained,
          score_gained: pointsCalculated,
          level_completed: level
        })
      });

      const progressJson = await progressRes.json().catch(() => null);
      if (!progressRes.ok) {
        console.warn('Progress update failed:', progressJson);
      }

    } catch (e) {
      console.error("Error synchronizing level stats to DB:", e);
    }
  };

  const handleAnswer = (selected) => {
    if (selectedChoice !== null || showResultModal || isPaused || !currentQuestion) return;

    const isAnswerCorrect = selected === currentQuestion.translation_term;
    setSelectedChoice(selected);
    setIsCorrect(isAnswerCorrect);

    setTimeout(async () => {
      if (isAnswerCorrect) {
        const nextScore = currentScore + 1;
        setCurrentScore(nextScore);

        if (nextScore >= totalQuestionsInLevel) {
          await handleLevelComplete(nextScore); 
          setResultType('win');
          setShowResultModal(true);
        } else if (availableQuestions.length > 0) {
          generateQuestion(availableQuestions[0], availableQuestions.slice(1), challengeBank);
        }
      } else {
        const newHearts = Math.max(0, globalHearts - 1);
        setGlobalHearts(newHearts);

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user?.id) throw new Error('No active session');

          await AsyncStorage.setItem(getUserCacheKey('hearts', session.user.id), newHearts.toString());

          // ✅ Synchronize explicit life deductions to database endpoints
          const syncHeartRes = await fetch(`${API_URL}/progress/lose-heart`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              game_id: WORD_MATCHER_GAME_ID,
              difficulty: gameDifficulty,
              current_hearts: newHearts,
            })
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
          setSelectedChoice(null);
          setIsCorrect(null);
        }
      }
    }, 600);
  };

  const handleNextLevel = () => {
    setShowResultModal(false);
    setLevel(prev => prev + 1);
  };

  const handleQuit = () => {
    setIsPaused(false);
    setShowResultModal(false);
    router.back();
  };

  if (loading) return (
    <View style={styles.gameContainer}>
      <ActivityIndicator size="large" color="#421C00" />
    </View>
  );

  return (
    <SafeAreaView style={styles.gameContainer} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={() => setIsPaused(true)}>
          <Ionicons name="pause-circle" size={45} color="#421C00" />
        </TouchableOpacity>
        
        <View style={{ flex: 1, paddingHorizontal: 15 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontWeight: '900', fontSize: 12, color: '#421C00' }}>LEVEL {level}</Text>
            <Text style={{ fontWeight: '900', fontSize: 12, color: '#421C00' }}>{currentScore}/{totalQuestionsInLevel}</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <View style={styles.heartContainer}>
          <Ionicons name="heart" size={24} color="#F44336" />
          <Text style={styles.heartText}>{globalHearts}</Text>
        </View>
      </View>

      <View style={styles.questionSection}>
        <Text style={styles.hintText}>
          Translate to {displayLanguagePool.charAt(0).toUpperCase() + displayLanguagePool.slice(1)}:
        </Text>
        <View style={styles.questionCard}>
          <Text style={[styles.questionWord, gameDifficulty === 'hard' && { fontSize: 20, textAlign: 'center', lineHeight: 28 }]}>
            {currentQuestion?.display_text}
          </Text>
        </View>
      </View>

      <View style={styles.choicesContainer}>
        {choices.map((choice, i) => (
          <TouchableOpacity 
            key={i} 
            style={[
              styles.choiceBtn, 
              selectedChoice === choice && (isCorrect ? styles.correctChoice : styles.wrongChoice),
              gameDifficulty === 'hard' && { minHeight: 60, paddingVertical: 12 }
            ]}
            onPress={() => handleAnswer(choice)}
            disabled={selectedChoice !== null}
          >
            <Text style={[
              styles.choiceLabel, 
              selectedChoice === choice && { color: '#FFF' },
              gameDifficulty === 'hard' && { fontSize: 15, textAlign: 'center' }
            ]}>
              {choice}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PAUSE MODAL */}
      <Modal transparent visible={isPaused} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>GAME PAUSED</Text>
            <TouchableOpacity style={styles.mainButton} onPress={() => setIsPaused(false)}>
              <Ionicons name="play" size={20} color="#FFF" style={{marginRight: 8}} />
              <Text style={styles.buttonText}>RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleQuit}>
              <Text style={styles.secondaryButtonText}>QUIT GAME</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* RESULT / LOSS STORE MODAL */}
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
              <TouchableOpacity style={styles.mainButton} onPress={handleNextLevel}>
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