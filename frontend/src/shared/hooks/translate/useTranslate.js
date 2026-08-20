import { useRef } from 'react';
import { Alert, Clipboard } from 'react-native';

import { useTranslationCore } from './useTranslationCore';
import { useTranslationAudio } from './useTranslationAudio';
import { useTranslationFeedback } from './useTranslationFeedback';
import { useTranslationMeta } from './useTranslationMeta';
import { useTranslationDocument } from './useTranslationDocument';

export { LANGUAGES, DIALECT_OPTIONS } from './constants';

export const useTranslate = () => {
  const skipDebounceRef = useRef(false);
  const callbacksRef = useRef({
    setBreakdownData: null,
    setFeedback: null,
  });

  const audioProps = useTranslationAudio();

  const coreProps = useTranslationCore({
    skipDebounceRef,
    onTranslateSuccess: (data) => {
      if (data.breakdown && callbacksRef.current.setBreakdownData) {
        callbacksRef.current.setBreakdownData(data.breakdown);
      }
    },
    onTranslateClear: () => {
      if (callbacksRef.current.setBreakdownData) {
        callbacksRef.current.setBreakdownData(null);
      }
      if (callbacksRef.current.setFeedback) {
        callbacksRef.current.setFeedback(null);
      }
    }
  });

  const feedbackProps = useTranslationFeedback({
    currentTranslationId: coreProps.currentTranslationId,
    inputText: coreProps.inputText,
    sourceLang: coreProps.sourceLang,
    targetLang: coreProps.targetLang,
  });

  const metaProps = useTranslationMeta({
    inputText: coreProps.inputText,
    translation: coreProps.translation,
    setTranslation: coreProps.setTranslation,
    sourceLang: coreProps.sourceLang,
    targetLang: coreProps.targetLang,
    targetDialect: coreProps.targetDialect,
  });

  const documentProps = useTranslationDocument({
    sourceLang: coreProps.sourceLang,
    targetLang: coreProps.targetLang,
    targetDialect: coreProps.targetDialect,
  });

  // Keeping refs synced with latest setters
  callbacksRef.current.setBreakdownData = metaProps.setBreakdownData;
  callbacksRef.current.setFeedback = feedbackProps.setFeedback;

  const handleCopy = () => {
    if (!coreProps.translation) return;
    Clipboard.setString(coreProps.translation);
    Alert.alert('Copied!', 'Translation copied to clipboard.');
  };

  return {
    skipDebounceRef,
    handleCopy,
    ...coreProps,
    ...audioProps,
    ...feedbackProps,
    ...metaProps,
    ...documentProps
  };
};
