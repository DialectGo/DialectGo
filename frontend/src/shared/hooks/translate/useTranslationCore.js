import { useState, useEffect } from 'react';
import { LayoutAnimation } from 'react-native';
import { translateText } from '../../services/translate/translationService';
import { LANGUAGES } from './constants';

export const useTranslationCore = ({ skipDebounceRef, onTranslateSuccess, onTranslateClear }) => {
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Cebuano');
  const [targetDialect, setTargetDialect] = useState(null);
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [currentTranslationId, setCurrentTranslationId] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState('source');
  const [speechModalVisible, setSpeechModalVisible] = useState(false);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);

  const handleTranslate = async (text) => {
    if (!text.trim()) {
      setTranslation('');
      setError(false);
      onTranslateClear();
      return;
    }
    setIsLoading(true);
    setError(false);
    onTranslateClear();

    try {
      const data = await translateText({
        sourceText: text,
        sourceLang,
        targetLang,
        targetDialect,
        sourceLangId: LANGUAGES.find(l => l.name === sourceLang)?.id,
        targetLangId: LANGUAGES.find(l => l.name === targetLang)?.id,
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTranslation(data.translatedText?.trim() || "");
      setCurrentTranslationId(data.historyRecord?.id || data.historyId);
      onTranslateSuccess(data);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      if (inputText) handleTranslate(inputText);
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [inputText, targetLang, sourceLang, targetDialect]);

  const selectLanguage = (langObj) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectingFor === 'source') {
      if (langObj.name === targetLang) setTargetLang(sourceLang);
      setSourceLang(langObj.name);
    } else {
      if (langObj.name === sourceLang) setSourceLang(targetLang);
      setTargetLang(langObj.name);
      setTargetDialect(null);
    }
    setModalVisible(false);
  };

  return {
    sourceLang, setSourceLang, targetLang, setTargetLang, targetDialect, setTargetDialect,
    inputText, setInputText, translation, setTranslation, currentTranslationId,
    isLoading, error, handleTranslate, selectLanguage,
    modalVisible, setModalVisible, selectingFor, setSelectingFor,
    speechModalVisible, setSpeechModalVisible, moreMenuVisible, setMoreMenuVisible
  };
};
