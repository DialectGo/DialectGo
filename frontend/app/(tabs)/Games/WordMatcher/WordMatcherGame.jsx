import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, SafeAreaView, StatusBar, Text, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { styles } from './WordMatcherStyles';
import { supabase } from '../../../../shared/lib/supabase';

const API_URL = 'http://192.168.1.53:5001/api';

export default function WordMatcherGame() {
  const router = useRouter(); 
  const params = useLocalSearchParams();
  
  const [level, setLevel] = useState(parseInt(params.initialLevel) || 1);
  const [globalHearts, setGlobalHearts] = useState(8); 
  const [currentScore, setCurrentScore] = useState(0); 
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

  const progressPercent = (currentScore / totalQuestionsInLevel) * 100;
  const gameDifficulty = params.difficulty || 'easy';
  const displayLanguagePool = params.targetLanguage || 'english';

  const fetchGameChallenges = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert("Authentication Required", "Please re-login to download game assets.");
        router.back();
        return;
      }

      // Appended targetLanguage preference to endpoint path query string
      const url = `${API_URL}/games/1/challenges?difficulty=${gameDifficulty}&level=${level}&targetLanguage=${displayLanguagePool}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
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

  const handleLevelComplete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const savedLevels = await AsyncStorage.getItem(`completed_levels_${gameDifficulty}`);
      let levelsArray = savedLevels ? JSON.parse(savedLevels) : [];
      
      if (!levelsArray.includes(level)) {
        levelsArray.push(level);
        await AsyncStorage.setItem(`completed_levels_${gameDifficulty}`, JSON.stringify(levelsArray));
      }

      const accuracy = (currentScore / totalQuestionsInLevel) * 100;
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

      const xpGained = gameDifficulty === 'hard' ? 30 : gameDifficulty === 'medium' ? 20 : 10;
      await fetch(`${API_URL}/progress/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ xp_gained: xpGained })
      });

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
          await handleLevelComplete(); 
          setResultType('win');
          setShowResultModal(true);
        } else if (availableQuestions.length > 0) {
          generateQuestion(availableQuestions[0], availableQuestions.slice(1), challengeBank);
        }
      } else {
        const newHearts = Math.max(0, globalHearts - 1);
        setGlobalHearts(newHearts);
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
    <SafeAreaView style={styles.gameContainer}>
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

      {/* RESULT MODAL */}
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
              <Text style={{ textAlign: 'center', marginBottom: 20 }}>Babalik ang iyong hearts mamaya.</Text>
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