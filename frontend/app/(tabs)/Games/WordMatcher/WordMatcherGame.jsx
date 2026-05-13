import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { styles } from './WordMatcherStyles';

// IMPORT DATA
import easyWords from '../../../../data/games/WordMatch/EasyWords.json';
import mediumWords from '../../../../data/games/WordMatch/MediumWords.json';
import hardWords from '../../../../data/games/WordMatch/HardWords.json';

export default function WordMatcherGame() {
  const router = useRouter(); 
  const params = useLocalSearchParams();
  
  const [level, setLevel] = useState(parseInt(params.initialLevel) || 1);
  const [globalHearts, setGlobalHearts] = useState(10);
  const [currentScore, setCurrentScore] = useState(0); 
  const [loading, setLoading] = useState(true);
  
  const [totalQuestionsInLevel, setTotalQuestionsInLevel] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [choices, setChoices] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]); 
  
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctWordsList, setCorrectWordsList] = useState([]);
  
  // MODAL STATES
  const [isPaused, setIsPaused] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState(null); // 'win' or 'lose'

  const progressPercent = (currentScore / totalQuestionsInLevel) * 100;

  // --- PROGRESS SAVING ---
  const saveLevelProgress = async (completedLvl) => {
    try {
      const savedLevels = await AsyncStorage.getItem('completed_levels');
      let levelsArray = savedLevels ? JSON.parse(savedLevels) : [];
      
      if (!levelsArray.includes(completedLvl)) {
        levelsArray.push(completedLvl);
        await AsyncStorage.setItem('completed_levels', JSON.stringify(levelsArray));
      }
    } catch (e) {
      console.error("Error saving progress:", e);
    }
  };

  // --- GET DATA BANK ---
  const getBank = useCallback(() => {
    const diff = params.difficulty || 'easy';
    if (diff === 'hard') return hardWords;
    if (diff === 'medium') return mediumWords;
    return easyWords;
  }, [params.difficulty]);

  // --- HEARTS LOGIC ---
  const loadHearts = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('global_hearts');
      if (saved !== null) setGlobalHearts(parseInt(saved));
    } catch (e) { console.error(e); }
  }, []);

  const saveHearts = async (count) => {
    setGlobalHearts(count);
    await AsyncStorage.setItem('global_hearts', count.toString());
  };

  useEffect(() => { loadHearts(); }, [loadHearts]);

  // --- QUESTION GENERATOR ---
  const generateQuestion = useCallback((nextQ, list) => {
    if (!nextQ) return; 

    const bank = getBank();
    setSelectedChoice(null);
    setIsCorrect(null);
    
    const distractors = [...bank]
      .filter(item => item && nextQ && item.id !== nextQ.id) 
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(item => item.cebuano);

    setChoices([...distractors, nextQ.cebuano].sort(() => 0.5 - Math.random()));
    setCurrentQuestion(nextQ);
    setAvailableQuestions(list);
  }, [getBank]);

  // --- LEVEL SETUP ---
  const setupLevel = useCallback((lvl) => {
    setLoading(true);
    const numQuestions = 2 + lvl; 
    setTotalQuestionsInLevel(numQuestions);

    const bank = getBank();
    const shuffled = [...bank].sort(() => 0.5 - Math.random()).slice(0, numQuestions);

    setCurrentScore(0);
    if (shuffled.length > 0) {
      generateQuestion(shuffled[0], shuffled.slice(1));
    }
    setLoading(false);
  }, [getBank, generateQuestion]);

  useEffect(() => { setupLevel(level); }, [level, setupLevel]);

  // --- HANDLERS ---
  const handleAnswer = (selected) => {
    if (selectedChoice !== null || showResultModal || isPaused || !currentQuestion) return;

    const isAnswerCorrect = selected === currentQuestion.cebuano;
    setSelectedChoice(selected);
    setIsCorrect(isAnswerCorrect);

    setTimeout(async () => {
      if (isAnswerCorrect) {
        const nextScore = currentScore + 1;
        setCurrentScore(nextScore);

        if (nextScore >= totalQuestionsInLevel) {
          await saveLevelProgress(level); 
          setResultType('win');
          setShowResultModal(true);
        } else if (availableQuestions.length > 0) {
          generateQuestion(availableQuestions[0], availableQuestions.slice(1));
        }
      } else {
        const newHearts = Math.max(0, globalHearts - 1);
        await saveHearts(newHearts);
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
      
      {/* HEADER */}
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

      {/* QUESTION AREA */}
      <View style={styles.questionSection}>
        <Text style={styles.hintText}>Translate to Cebuano:</Text>
        <View style={styles.questionCard}>
          <Text style={styles.questionWord}>{currentQuestion?.english}</Text>
        </View>
      </View>

      {/* CHOICES AREA */}
      <View style={styles.choicesContainer}>
        {choices.map((choice, i) => (
          <TouchableOpacity 
            key={i} 
            style={[styles.choiceBtn, selectedChoice === choice && (isCorrect ? styles.correctChoice : styles.wrongChoice)]}
            onPress={() => handleAnswer(choice)}
            disabled={selectedChoice !== null}
          >
            <Text style={[styles.choiceLabel, selectedChoice === choice && { color: '#FFF' }]}>{choice}</Text>
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