import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const allSentences = {
  tagalog: [
    { prompt: "Kumain ako.", translation: ["Nangaon", "ko."] },
    { prompt: "Nagtatakbo ka.", translation: ["Nagdalagan", "ka."] },
    { prompt: "Masaya tayo.", translation: ["Malipayon", "ta."] },
    { prompt: "Mahal kita.", translation: ["Gihigugma", "tika."] },
    { prompt: "Magandang umaga.", translation: ["Maayong", "buntag."] },
    { prompt: "Gutom na ako.", translation: ["Gigutom", "na", "ko."] },
    { prompt: "Saan ka pupunta?", translation: ["Asa", "ka", "moadto?"] },
    { prompt: "Salamat sa iyo.", translation: ["Salamat", "kanimo."] },
  ],
  cebuano: [
    { prompt: "Nangaon ko.", translation: ["Kumain", "ako."] },
    { prompt: "Nagdalagan ka.", translation: ["Nagtatakbo", "ka."] },
    { prompt: "Malipayon ta.", translation: ["Masaya", "tayo."] },
    { prompt: "Gihigugma tika.", translation: ["Mahal", "kita."] },
    { prompt: "Maayong buntag.", translation: ["Magandang", "umaga."] },
    { prompt: "Gigutom na ko.", translation: ["Gutom", "na", "ako."] },
    { prompt: "Asa ka moadto?", translation: ["Saan", "ka", "pupunta?"] },
    { prompt: "Salamat kanimo.", translation: ["Salamat", "sa", "iyo."] },
  ],
};

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function pickRandom(array, n) {
  return shuffleArray(array).slice(0, n);
}

function AlertModal({ visible, type, score, streak, bestStreak, onClose }) {
  if (!visible) return null;

  const isDone = type === 'done';
  const isCorrect = type === 'correct';

  const accent = isDone ? '#FDCE4A' : isCorrect ? '#4A7C6F' : '#C0544A';
  const iconName = isDone
    ? 'trophy-outline'
    : isCorrect
      ? 'check-circle-outline'
      : 'close-circle-outline';

  const titleText = isDone ? 'Round complete!' : isCorrect ? 'Correct!' : 'Wrong order!';
  const subText = isDone ? `You finished all the sentences!` : isCorrect ? `Keep going — you're on a roll!` : "Don't worry, give it another try!";
  const btnText = isDone ? 'Play Again' : isCorrect ? 'Continue' : 'Try Again';

  return (
    <View style={modalStyles.overlay}>
      <View style={[modalStyles.box, { borderTopColor: accent, borderTopWidth: 5 }]}>
        <View style={[modalStyles.iconCircle, { borderColor: accent }]}>
          <Icon name={iconName} size={48} color={accent} />
        </View>
        <Text style={modalStyles.title}>{titleText}</Text>
        <Text style={modalStyles.sub}>{subText}</Text>
        {isDone && (
          <View style={modalStyles.statsRow}>
            <View style={modalStyles.statCard}>
              <Text style={modalStyles.statLabel}>SCORE</Text>
              <Text style={modalStyles.statVal}>{score}</Text>
            </View>
            <View style={modalStyles.statCard}>
              <Text style={modalStyles.statLabel}>BEST STREAK</Text>
              <Text style={[modalStyles.statVal, { color: '#FDCE4A' }]}>{bestStreak} 🔥</Text>
            </View>
          </View>
        )}
        <TouchableOpacity
          style={[modalStyles.btn, { backgroundColor: accent }]}
          onPress={onClose}
        >
          <Text style={modalStyles.btnText}>{btnText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(20,40,40,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 28,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 72, height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '900', color: '#1F2937', marginBottom: 8 },
  sub: { fontSize: 15, color: '#6b8080', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20, width: '100%' },
  statCard: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12, alignItems: 'center' },
  statLabel: { fontSize: 10, letterSpacing: 0.8, color: '#8BA7A7', marginBottom: 2 },
  statVal: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  btn: { width: '100%', paddingVertical: 15, borderRadius: 50, alignItems: 'center' },
  btnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});

export default function WordBridgeGame() {
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('tagalog');
  const [alertModal, setAlertModal] = useState(null);

  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledWords, setScrambledWords] = useState([]);
  const [userSelection, setUserSelection] = useState([]);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const currentSentence = sentences[currentIndex] ?? { prompt: '', translation: [] };

  function startGame() {
    const picked = pickRandom(allSentences[mode], 6);
    setSentences(picked);
    setCurrentIndex(0);
    setScrambledWords(shuffleArray(picked[0].translation));
    setUserSelection([]);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setScreen('game');
  }

  function handleWordPress(word, bankIndex) {
    const newSelection = [...userSelection, word];
    const newScrambled = [...scrambledWords];
    newScrambled.splice(bankIndex, 1);

    setUserSelection(newSelection);
    setScrambledWords(newScrambled);

    if (newSelection.length === currentSentence.translation.length) {
      const correct = newSelection.join(' ') === currentSentence.translation.join(' ');
      setTimeout(() => {
        if (correct) {
          const newStreak = streak + 1;
          const bonus = newStreak * 2;
          const newScore = score + 10 + bonus;
          setStreak(newStreak);
          setScore(newScore);
          if (newStreak > bestStreak) setBestStreak(newStreak);
          setAlertModal(currentIndex + 1 < sentences.length ? 'correct' : 'done');
        } else {
          setStreak(0);
          setAlertModal('wrong');
        }
      }, 500);
    }
  }

  function handleUndo() {
    if (userSelection.length === 0) return;
    const last = userSelection[userSelection.length - 1];
    const newSelection = userSelection.slice(0, -1);
    setUserSelection(newSelection);
    setScrambledWords(prev => shuffleArray([...prev, last]));
  }

  function handleModalClose() {
    const t = alertModal;
    setAlertModal(null);

    if (t === 'done') {
      setScreen('home');
    } else if (t === 'correct') {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setScrambledWords(shuffleArray(sentences[nextIndex].translation));
      setUserSelection([]);
    } else {
      setUserSelection([]);
      setScrambledWords(shuffleArray(currentSentence.translation));
    }
  }

  // HOME SCREEN 
  if (screen === 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.homeContent}>

          <Text style={styles.homeLogo}>
            <Text style={{ color: '#FDCE4A' }}>Word</Text>
            <Text style={{ color: '#604B48' }}>Bridge</Text>
          </Text>

          <Text style={styles.homeSubtitle}>Translate. Tap. Learn.</Text>
          <Text style={styles.homeDetail}>Tagalog ↔ Cebuano · Score · Streak</Text>

          <Text style={styles.modeLabel}>TRANSLATE FROM</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'tagalog' && styles.modeBtnActive]}
              onPress={() => setMode('tagalog')}
            >
              <Text style={[styles.modeBtnText, mode === 'tagalog' && styles.modeBtnTextActive]}>
                Tagalog → Cebuano
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'cebuano' && styles.modeBtnActive]}
              onPress={() => setMode('cebuano')}
            >
              <Text style={[styles.modeBtnText, mode === 'cebuano' && styles.modeBtnTextActive]}>
                Cebuano → Tagalog
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startText}>Start Game</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  }

  // GAME SCREEN
  return (
    <SafeAreaView style={styles.container}>

      <AlertModal
        visible={!!alertModal}
        type={alertModal}
        score={score}
        streak={streak}
        bestStreak={bestStreak}
        onClose={handleModalClose}
      />

      <View style={styles.gameContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            <Text style={{ color: '#FDCE4A' }}>Word</Text>
            <Text style={{ color: '#604B48' }}>Bridge</Text>
          </Text>
          <View style={styles.progressBubble}>
            <Text style={styles.progressText}>{currentIndex + 1}/{sentences.length}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(currentIndex / sentences.length) * 100}%` }
            ]}
          />
        </View>

        {/* Score / Streak / Best */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Text style={styles.statVal}>{score}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>STREAK</Text>
            <Text style={[styles.statVal, { color: '#FDCE4A' }]}>{streak} 🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>BEST</Text>
            <Text style={styles.statVal}>{bestStreak}</Text>
          </View>
        </View>

        {/* Direction badge */}
        <View style={[styles.directionBadge, mode === 'tagalog' ? styles.dirTL : styles.dirCB]}>
          <Text style={[styles.directionText, mode === 'tagalog' ? styles.dirTLText : styles.dirCBText]}>
            {mode === 'tagalog' ? 'TAGALOG → CEBUANO' : 'CEBUANO → TAGALOG'}
          </Text>
        </View>

        <Text style={styles.translateLabel}>TRANSLATE THIS</Text>
        <Text style={styles.englishText}>"{currentSentence.prompt}"</Text>
        <Text style={styles.instruction}>Tap the words below in the correct order.</Text>

        {/* Word bank */}
        <Text style={styles.wordBankLabel}>WORD BANK</Text>
        <View style={styles.wordContainer}>
          {scrambledWords.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={styles.wordButton}
              onPress={() => handleWordPress(word, index)}
            >
              <Text style={styles.wordText}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Answer box + Undo */}
        <Text style={styles.translationLabel}>YOUR TRANSLATION</Text>
        <View style={styles.answerRow}>
          <View style={styles.answerBox}>
            {userSelection.length === 0 ? (
              <Text style={styles.placeholder}>Tap words to build your answer...</Text>
            ) : (
              <View style={styles.userWords}>
                {userSelection.map((word, index) => (
                  <Text key={index} style={styles.userWord}>{word}</Text>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.undoBtn, userSelection.length === 0 && styles.undoBtnDisabled]}
            onPress={handleUndo}
            disabled={userSelection.length === 0}
          >
            <Icon name="arrow-u-left-top" size={22} color="#604B48" />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Home 
  homeContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 200,
    alignItems: 'center',
  },
  homeLogo: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  homeSubtitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
    fontWeight: '600',
  },
  homeDetail: {
    fontSize: 13,
    color: '#8BA7A7',
    marginBottom: 36,
  },
  modeLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: '#8BA7A7',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
    width: '100%',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D0DADA',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  modeBtnActive: {
    borderColor: '#FDCE4A',
    backgroundColor: '#FFFBEE',
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
  },
  modeBtnTextActive: {
    color: '#604B48',
  },
  startButton: {
    backgroundColor: '#FDCE4A',
    paddingVertical: 13,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  startText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // ── Game 
  gameContent: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBubble: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  progressText: {
    fontWeight: '600',
    color: '#666',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#FDCE4A44',
    borderRadius: 5,
    marginTop: 12,
    marginBottom: 14,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#604B48',
    borderRadius: 5,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#8BA7A7',
    marginBottom: 2,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },

  // Direction badge
  directionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  dirTL: { backgroundColor: '#E8F0FF' },
  dirCB: { backgroundColor: '#FFF3E0' },
  directionText: { fontSize: 10, letterSpacing: 0.8, fontWeight: '700' },
  dirTLText: { color: '#FFFFF' },
  dirCBText: { color: '#B8490A' },

  translateLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: '#8BA7A7',
  },
  englishText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#1F2937',
  },
  instruction: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 13,
    color: '#7A8C8C',
  },
  wordBankLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: '#8BA7A7',
    marginBottom: 8,
  },
  wordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  wordButton: {
    backgroundColor: '#FDCE4A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
  },
  wordText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  translationLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: '#8BA7A7',
    marginBottom: 8,
  },

  // Answer row
  answerRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
  },
  answerBox: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#604B48',
    borderRadius: 15,
    padding: 14,
    minHeight: 60,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  placeholder: {
    color: '#FDCE4A',
    fontStyle: 'italic',
    fontSize: 13,
  },
  userWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  userWord: {
    fontSize: 17,
    color: '#604B48',
    fontWeight: '700',
  },
  undoBtn: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 15,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
  },
  undoBtnDisabled: {
    opacity: 0.3,
  },
});