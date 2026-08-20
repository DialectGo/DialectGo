import { useState } from 'react';
import { Alert, LayoutAnimation } from 'react-native';
import { translateText, customizeTranslation } from '../../services/translate/translationService';
import { LANGUAGES } from './constants';

export const useTranslationMeta = ({ inputText, translation, setTranslation, sourceLang, targetLang, targetDialect }) => {
  const [breakdownData, setBreakdownData] = useState(null);
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);
  const [breakdownPanelVisible, setBreakdownPanelVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [isCustomizeLoading, setIsCustomizeLoading] = useState(false);

  const handleShowBreakdown = async () => {
    if (breakdownData) return;
    setIsBreakdownLoading(true);
    try {
      const data = await translateText({
        sourceText: inputText,
        sourceLang,
        targetLang,
        targetDialect,
        sourceLangId: LANGUAGES.find(l => l.name === sourceLang)?.id,
        targetLangId: LANGUAGES.find(l => l.name === targetLang)?.id,
        withBreakdown: true,
      });

      if (data.breakdown) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBreakdownData(data.breakdown);
      }
    } catch (err) {
      console.error("Failed to fetch breakdown", err);
    } finally {
      setIsBreakdownLoading(false);
    }
  };

  const handleCustomizeSubmit = async (params) => {
    setIsCustomizeLoading(true);
    try {
      const customizedText = await customizeTranslation({
        sourceText: inputText,
        translatedText: translation,
        sourceLang,
        targetLang,
        options: params,
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTranslation(customizedText);
      setShowCustomize(false);
      setBreakdownData(null);
    } catch (err) {
      console.error("Customize error", err);
      Alert.alert("Error", "Could not reach customization service.");
    } finally {
      setIsCustomizeLoading(false);
    }
  };

  return {
    breakdownData, setBreakdownData,
    isBreakdownLoading, breakdownPanelVisible, setBreakdownPanelVisible,
    showCustomize, setShowCustomize, isCustomizeLoading,
    handleShowBreakdown, handleCustomizeSubmit
  };
};
