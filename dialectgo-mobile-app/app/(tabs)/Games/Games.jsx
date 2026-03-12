import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const sentences = [
  { english: "I am eating", translation: ["Ako", "nagakaon"] },
  { english: "You are running", translation: ["Ikaw", "nagadalagan"] },
  { english: "We are happy", translation: ["Kita", "malipayon"] },
];

function AlertModal({ visible, type, onClose }) {
  if (!visible) return null;

  const isDone = type === "done";
  const isCorrect = type === "correct";

  const accent = isDone ? "#FDCE4A" : isCorrect ? "#4A7C6F" : "#C0544A";
  const btnColor = isDone ? "#FDCE4A" : isCorrect ? "#4A7C6F" : "#C0544A";

  const iconName = isDone
    ? "trophy-outline"
    : isCorrect
      ? "check-circle-outline"
      : "close-circle-outline";

  const titleText = isDone
    ? "You finished!"
    : isCorrect
      ? "Correct!"
      : "Wrong order!";

  const subText = isDone
    ? "Amazing work — you completed all sentences!"
    : isCorrect
      ? "Great job! On to the next one."
      : "Don't worry, give it another try!";

  const btnText = isDone
    ? "Play Again"
    : isCorrect
      ? "Continue"
      : "Try Again";

  return (
    <View style={modalStyles.overlay}>
      <View style={[modalStyles.box, { borderTopColor: accent, borderTopWidth: 5 }]}>

        <View style={[modalStyles.iconCircle, { borderColor: accent }]}>
          <Icon name={iconName} size={48} color={accent} />
        </View>

        <Text style={modalStyles.title}>{titleText}</Text>

        <Text style={modalStyles.sub}>{subText}</Text>

        <TouchableOpacity
          style={[modalStyles.btn, { backgroundColor: btnColor }]}
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
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(20,40,40,0.55)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    padding: 28,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: { fontSize: 52, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "900", color: "#1F2937", marginBottom: 8 },
  sub: { fontSize: 15, color: "#6b8080", textAlign: "center", marginBottom: 28, lineHeight: 22 },
  btn: { width: "100%", paddingVertical: 15, borderRadius: 50, alignItems: "center" },
  btnText: { fontSize: 17, fontWeight: "800", color: "#fff" },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
});

export default function WordBridgeGame() {

  const [screen, setScreen] = useState("home"); // HOME OR GAME
  const [alertModal, setAlertModal] = useState(null); // null | "correct" | "wrong" | "done"

  function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledWords, setScrambledWords] = useState(
    shuffleArray(sentences[0].translation)
  );
  const [userSelection, setUserSelection] = useState([]);

  const currentSentence = sentences[currentIndex];

  function handleWordPress(word) {

    if (userSelection.includes(word)) return;

    const newSelection = [...userSelection, word];
    setUserSelection(newSelection);

    const remainingWords = scrambledWords.filter(w => w !== word);
    setScrambledWords(remainingWords);

    if (newSelection.length === currentSentence.translation.length) {

      const correct =
        newSelection.join(" ") === currentSentence.translation.join(" ");

      setTimeout(() => {

        if (correct) {

          if (currentIndex + 1 < sentences.length) {

            setAlertModal("correct");

          } else {

            setAlertModal("done");
          }

        } else {
          setAlertModal("wrong");
        }

      }, 500);
    }
  }

  /* ---------------- HOME SCREEN ---------------- */

  if (screen === "home") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.homeCard}>

          <Text style={styles.homeLogo}>
            <Text style={{ color: "#FDCE4A" }}>Word</Text>
            <Text style={{ color: "#604B48" }}>Bridge</Text>
          </Text>

          <Text style={styles.homeSubtitle}>
            Learn local language by building sentences!
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setScreen("game")}
          >
            <Text style={styles.startText}>Start Game</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  }

  /* ---------------- GAME SCREEN ---------------- */

  return (
    <SafeAreaView style={styles.container}>

      <AlertModal
        visible={!!alertModal}
        type={alertModal}
        onClose={() => {
          const t = alertModal;
          setAlertModal(null);
          if (t === "done") {
            setCurrentIndex(0);
            setScrambledWords(shuffleArray(sentences[0].translation));
            setUserSelection([]);
            setScreen("home");
          } else if (t === "correct") {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setScrambledWords(shuffleArray(sentences[nextIndex].translation));
            setUserSelection([]);
          } else if (t === "wrong") {
            setUserSelection([]);
            setScrambledWords(shuffleArray(currentSentence.translation));
          }
        }}
      />

      <View style={styles.card}>

        <View style={styles.header}>
          <Text style={styles.logo}>
            <Text style={{ color: "#FDCE4A" }}>Word</Text>
            <Text style={{ color: "#604B48" }}>Bridge</Text>
          </Text>

          <View style={styles.progressBubble}>
            <Text style={styles.progressText}>
              {currentIndex + 1}/{sentences.length}
            </Text>
          </View>
        </View>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((currentIndex + 1) / sentences.length) * 100}%` }
            ]}
          />
        </View>

        <Text style={styles.translateLabel}>TRANSLATE THIS PHRASE</Text>

        <Text style={styles.englishText}>
          "{currentSentence.english}"
        </Text>

        <Text style={styles.instruction}>
          Tap the words below in the correct order.
        </Text>

        <Text style={styles.wordBankLabel}>WORD BANK</Text>

        <View style={styles.wordContainer}>
          {scrambledWords.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={styles.wordButton}
              onPress={() => handleWordPress(word)}
            >
              <Text style={styles.wordText}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.translationLabel}>YOUR TRANSLATION</Text>

        <View style={styles.answerBox}>
          {userSelection.length === 0 ? (
            <Text style={styles.placeholder}>
              Tap words to build your answer...
            </Text>
          ) : (
            <View style={styles.userWords}>
              {userSelection.map((word, index) => (
                <Text key={index} style={styles.userWord}>{word}</Text>
              ))}
            </View>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#E8F0F0",
    justifyContent: "center",
    alignItems: "center"
  },

  /* HOME */

  homeCard: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 40,
    alignItems: "center"
  },

  homeLogo: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 10
  },

  homeSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center"
  },

  startButton: {
    backgroundColor: "#FDCE4A",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30
  },

  startText: {
    fontSize: 18,
    fontWeight: "bold"
  },

  /* GAME */

  card: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  logo: {
    fontSize: 20,
    fontWeight: "bold"
  },

  progressBubble: {
    backgroundColor: "#EEF0F6",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15
  },

  progressText: {
    fontWeight: "600",
    color: "#666"
  },

  progressBarBackground: {
    height: 6,
    backgroundColor: "#FDCE4A",
    borderRadius: 5,
    marginTop: 15
  },

  progressBarFill: {
    height: 6,
    backgroundColor: "#604B48",
    borderRadius: 5
  },

  translateLabel: {
    marginTop: 20,
    fontSize: 12,
    letterSpacing: 1,
    color: "#8BA7A7"
  },

  englishText: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 8,
    color: "#1F2937"
  },

  instruction: {
    marginTop: 8,
    fontSize: 14,
    color: "#7A8C8C"
  },

  wordBankLabel: {
    marginTop: 25,
    fontSize: 12,
    letterSpacing: 1,
    color: "#8BA7A7"
  },

  wordContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10
  },

  wordButton: {
    backgroundColor: "#FDCE4A",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
  },

  wordText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "600"
  },

  translationLabel: {
    marginTop: 20,
    fontSize: 12,
    letterSpacing: 1,
    color: "#8BA7A7"
  },

  answerBox: {
    marginTop: 10,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#604B48",
    borderRadius: 15,
    padding: 18,
    minHeight: 60,
    justifyContent: "center"
  },

  placeholder: {
    color: "#FDCE4A",
    fontStyle: "italic"
  },

  userWords: {
    flexDirection: "row",
    flexWrap: "wrap"
  },

  userWord: {
    fontSize: 18,
    marginRight: 8,
    color: "#FDCE4A",
    fontWeight: "600"
  },

});