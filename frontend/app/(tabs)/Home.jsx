import React from 'react';
import HomeScreen from '../../src/features/home/HomeScreen';

export default function HomeTabRoute({ onNavigate, activeTab }) {
  return <HomeScreen onNavigate={onNavigate} activeTab={activeTab} />;
}