import { useState } from 'react';
import { Alert } from 'react-native';
import { submitRating, submitDetailedFeedback } from '../../services/translate/translationService';
import { LANGUAGES } from './constants';

export const useTranslationFeedback = ({ currentTranslationId, inputText, sourceLang, targetLang }) => {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [comment, setComment] = useState('');
  const [suggestionText, setSuggestionText] = useState('');

  const handleQuickRating = async (ratingValue) => {
    if (!currentTranslationId) return Alert.alert("Wait", "Translate something first.");
    setFeedback(ratingValue === 5 ? 'like' : 'unlike');
    try {
      await submitRating(currentTranslationId, ratingValue);
      setFeedbackModalVisible(true);
    } catch (err) {
      console.error("Feedback error", err);
    }
  };

  const handleDetailedSubmit = async () => {
    try {
      await submitDetailedFeedback({
        translationId: currentTranslationId,
        rating: feedback === 'like' ? 5 : 1,
        comment,
        suggestionText,
        sourceText: inputText,
        sourceLang,
        targetLang,
        sourceLangId: LANGUAGES.find(l => l.name === sourceLang)?.id,
        targetLangId: LANGUAGES.find(l => l.name === targetLang)?.id,
      });

      Alert.alert("Salamat!", "Nakatulong ka sa pag-improve ng DialectoGo.");
      setFeedbackModalVisible(false);
      setComment('');
      setSuggestionText('');
    } catch (err) {
      Alert.alert("Error", "Hindi maipadala ang feedback.");
    }
  };

  return {
    feedbackModalVisible, setFeedbackModalVisible,
    rateModalVisible, setRateModalVisible,
    feedback, setFeedback,
    comment, setComment,
    suggestionText, setSuggestionText,
    handleQuickRating, handleDetailedSubmit
  };
};
