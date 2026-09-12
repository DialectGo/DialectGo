import { useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { translateDocument } from '../../services/translate/translationService';
import { LANGUAGES } from './constants';
import { useToast } from '../../context/ToastContext';

export const useTranslationDocument = ({ sourceLang, targetLang, targetDialect }) => {
  const [docUploadVisible, setDocUploadVisible] = useState(false);
  const [docConfirmVisible, setDocConfirmVisible] = useState(false);
  const [pendingFileAsset, setPendingFileAsset] = useState(null);
  const [docResultVisible, setDocResultVisible] = useState(false);
  const [isDocTranslating, setIsDocTranslating] = useState(false);
  const [docResult, setDocResult] = useState(null);
  const [docError, setDocError] = useState(false);
  
  const { showToast } = useToast();

  const handleDocumentSelected = (fileAsset) => {
    setPendingFileAsset(fileAsset);
    setDocConfirmVisible(true);
  };

  const cancelDocumentTranslation = () => {
    setDocConfirmVisible(false);
    setPendingFileAsset(null);
  };

  const confirmDocumentTranslation = async () => {
    if (!pendingFileAsset) return;
    
    const fileAsset = pendingFileAsset;
    setDocConfirmVisible(false);
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
      // Hide the large error modal and show a clean toast instead
      setDocResultVisible(false);
      setDocError(true);

      let shortMsg = err.message || "Failed to translate document.";
      if (shortMsg.includes('too much text')) {
        shortMsg = "File exceeds 5,000 character limit.";
      } else if (shortMsg.includes('too large')) {
        shortMsg = "File exceeds 2 MB size limit.";
      }

      showToast(shortMsg, "error", "Translation Error");
    } finally {
      setIsDocTranslating(false);
      setPendingFileAsset(null);
      try {
        await FileSystem.deleteAsync(fileAsset.uri, { idempotent: true });
      } catch (e) {
        console.warn("Failed to delete temp file:", e);
      }
    }
  };

  return {
    docUploadVisible, setDocUploadVisible,
    docConfirmVisible, setDocConfirmVisible,
    docResultVisible, setDocResultVisible,
    isDocTranslating, docResult, docError,
    handleDocumentSelected, confirmDocumentTranslation, cancelDocumentTranslation
  };
};
