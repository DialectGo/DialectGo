import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextToText from './TextToText';
import SpeechToText from './SpeechToText';
import ImageToText from './ImageToText';

export default function Translate() {
  const [activeTab, setActiveTab] = useState('text');

  const renderTranslationMode = () => {
    switch (activeTab) {
      case 'text':
        return <TextToText />;
      case 'speech':
        return <SpeechToText />;
      case 'image':
        return <ImageToText />;
      default:
        return <TextToText />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderTranslationMode()}
      </View>
      <View style={styles.navWrapper}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            {value: 'text', label: 'Text', icon: 'format-text',checkedColor: '#FFFFFF', style: activeTab === 'text' ? styles.activeBtn : styles.inactiveBtn,},
            {value: 'speech', label: 'Speech', icon: 'microphone', checkedColor: '#FFFFFF', style: activeTab === 'speech' ? styles.activeBtn : styles.inactiveBtn,},
            {value: 'image', label: 'Image', icon: 'camera', checkedColor: '#FFFFFF', style: activeTab === 'image' ? styles.activeBtn : styles.inactiveBtn,},
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  navWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  activeBtn: {
    backgroundColor: '#48AAD9',
  },
  inactiveBtn: {
    backgroundColor: 'transparent',
  },
});