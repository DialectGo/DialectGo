import { useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { translateDocument } from '../../services/translate/translationService';
import { LANGUAGES } from './constants';

export const useTranslationDocument = ({ sourceLang, targetLang, targetDialect }) => {
  const [docUploadVisible, setDocUploadVisible] = useState(false);
  const [docResultVisible, setDocResultVisible] = useState(false);
  const [isDocTranslating, setIsDocTranslating] = useState(false);
  const [docResult, setDocResult] = useState(null);
  const [docError, setDocError] = useState(false);

  const handleDocumentSelected = async (fileAsset) => {
    setDocResultVisible(true);
    setIsDocTranslating(true);
    setDocError(false);
    setDocResult(null);

    try {
      const data = await translateDocument({
        fileAsset,
        sourceLang,
        targetLang,
        targetDialect,
        sourceLangId: LANGUAGES.find(l => l.name === sourceLang)?.id,
        targetLangId: LANGUAGES.find(l => l.name === targetLang)?.id,
      });

      setDocResult(data);
    } catch (err) {
      console.error("[Translate] Document upload error:", err.message || err);
      setDocError(true);
    } finally {
      setIsDocTranslating(false);
      try {
        await FileSystem.deleteAsync(fileAsset.uri, { idempotent: true });
      } catch (e) {
        console.warn("Failed to delete temp file:", e);
      }
    }
  };

  return {
    docUploadVisible, setDocUploadVisible,
    docResultVisible, setDocResultVisible,
    isDocTranslating, docResult, docError,
    handleDocumentSelected
  };
};
