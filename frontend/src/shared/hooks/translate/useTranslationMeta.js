import { useState } from 'react';
import { Alert, LayoutAnimation } from 'react-native';
import { fetchBreakdownSSE, customizeTranslation } from '../../services/translate/translationService';

export const useTranslationMeta = ({ inputText, translation, setTranslation, sourceLang, targetLang, targetDialect, currentTranslationId, preprocessing }) => {
  const [breakdownData, setBreakdownData] = useState(null);
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);
  const [breakdownStatus, setBreakdownStatus] = useState('');
  const [breakdownPanelVisible, setBreakdownPanelVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [isCustomizeLoading, setIsCustomizeLoading] = useState(false);

  /**
   * Fetch breakdown via SSE — decoupled from the main translation call.
   * The translation text is already visible to the user; this runs async in the background.
   * Typically resolves in 3-8s (vs previous 6-7 min blocking call).
   */
  const handleShowBreakdown = async () => {
    // Return cached breakdown if already fetched
    if (breakdownData) {
      setBreakdownPanelVisible(true);
      return;
    }

    if (!inputText?.trim() || !translation?.trim()) {
      Alert.alert('No translation', 'Please translate some text first before requesting a breakdown.');
      return;
    }

    setIsBreakdownLoading(true);
    setBreakdownStatus('Connecting...');

    try {
      const breakdown = await fetchBreakdownSSE({
        sourceText: inputText,
        translatedText: translation,
        sourceLang,
        targetLang,
        targetDialect: targetDialect || null,
        // preprocessing is a ref — read .current to get the latest value
        preprocessingMeta: (preprocessing?.current ?? preprocessing) || null,
        translationId: currentTranslationId || null,
        onStatusUpdate: (status) => setBreakdownStatus(status),
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setBreakdownData(breakdown);
      setBreakdownPanelVisible(true);
    } catch (err) {
      console.error('[useTranslationMeta] Breakdown fetch failed:', err);
      Alert.alert('Breakdown unavailable', 'Could not load the linguistic breakdown right now. Please try again.');
    } finally {
      setIsBreakdownLoading(false);
      setBreakdownStatus('');
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
      setBreakdownData(null); // Invalidate breakdown since translation changed
    } catch (err) {
      console.error('Customize error', err);
      Alert.alert('Error', 'Could not reach customization service.');
    } finally {
      setIsCustomizeLoading(false);
    }
  };

  return {
    breakdownData, setBreakdownData,
    isBreakdownLoading, breakdownStatus,
    breakdownPanelVisible, setBreakdownPanelVisible,
    showCustomize, setShowCustomize, isCustomizeLoading,
    handleShowBreakdown, handleCustomizeSubmit
  };
};
