import { useRef, useState } from 'react';
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
    setPreprocessing: null,
  });
  // Stores the latest preprocessing metadata so the SSE breakdown endpoint can use it
  const preprocessingRef = useRef(null);

  const audioProps = useTranslationAudio();

  const coreProps = useTranslationCore({
    skipDebounceRef,
    onTranslateSuccess: (data) => {
      // Store preprocessing metadata so SSE breakdown endpoint can reference it
      preprocessingRef.current = data.preprocessing || null;
      // Clear stale breakdown when a new translation arrives
      if (callbacksRef.current.setBreakdownData) {
        callbacksRef.current.setBreakdownData(null);
      }
    },
    onTranslateClear: () => {
      preprocessingRef.current = null;
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
    currentTranslationId: coreProps.currentTranslationId,
    preprocessing: preprocessingRef, // Pass the ref so it always has latest value
  });

  const documentProps = useTranslationDocument({
    sourceLang: coreProps.sourceLang,
    targetLang: coreProps.targetLang,
    targetDialect: coreProps.targetDialect,
  });

  const [isCopied, setIsCopied] = useState(false);

  // Keeping refs synced with latest setters
  callbacksRef.current.setBreakdownData = metaProps.setBreakdownData;
  callbacksRef.current.setFeedback = feedbackProps.setFeedback;

  const handleCopy = () => {
    if (!coreProps.translation) return;
    Clipboard.setString(coreProps.translation);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return {
    skipDebounceRef,
    handleCopy,
    isCopied,
    ...coreProps,
    ...audioProps,
    ...feedbackProps,
    ...metaProps,
    ...documentProps
  };
};
