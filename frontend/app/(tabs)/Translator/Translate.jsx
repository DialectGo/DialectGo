import React from 'react';
import TranslateScreen from '../../../src/features/translator/TranslateScreen';

export default function Translate({ activeTab, onNavigate }) {
  return <TranslateScreen activeTab={activeTab} onNavigate={onNavigate} />;
}