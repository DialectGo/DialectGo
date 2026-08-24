import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import SubmissionDetailScreen from '../../../src/features/wiki/SubmissionDetailScreen';

export default function SubmissionDetail() {
  const { id } = useLocalSearchParams();
  return <SubmissionDetailScreen id={id} />;
}
