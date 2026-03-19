import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Surface, IconButton, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ResultExample from './ResultExample';
import SynonymResult from './SynonymResult';
import ResultTone from './ResultTone';

import pronounceIcon from '../../../../assets/icons/pronounceIcon.png';

export default function Result({ sourceText, translatedText, targetLang, sourceLang }) {
  const [activeTab, setActiveTab] = useState('examples');

  const renderSubContent = () => {
    switch (activeTab) {
      case 'examples': return <ResultExample sourceText={sourceText} translatedText={translatedText} />;
      case 'synonyms': return <SynonymResult translatedText={translatedText} />;
      case 'tone': return <ResultTone translatedText={translatedText} />;
      default: return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.resultCard} elevation={0}>
        <View style={styles.cardHeader}>
          <Text style={styles.langLabel}>{sourceLang}</Text>
          <TouchableOpacity><MaterialCommunityIcons name="close" size={24} color="#4b5563" /></TouchableOpacity>
        </View>
        
        <Text style={styles.sourceText}>{sourceText || "Hi there"}</Text>
        <Divider style={styles.divider} />

        <View style={styles.cardHeader}>
          <Text style={styles.langLabel}>{targetLang}</Text>
          <TouchableOpacity>
             <Image source={pronounceIcon} style={styles.pronounceIcon} />
          </TouchableOpacity>
        </View>

        <Text style={styles.translatedText}>{translatedText || "¡Hola!"}</Text>
        <Text style={styles.phonetic}>o-la</Text>

        <View style={styles.meaningSection}>
          <Text style={styles.sectionTitle}>MEANING</Text>
          <Text style={styles.meaningText}>
            This is a friendly greeting used to acknowledge someone or initiate a conversation.
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.feedbackRow}>
            <IconButton icon="thumb-up-outline" size={20} style={styles.feedbackBtn} />
            <IconButton icon="thumb-down-outline" size={20} style={styles.feedbackBtn} />
          </View>
          <TouchableOpacity style={styles.variantBtn}>
            <MaterialCommunityIcons name="sparkles" size={16} color="#48AAD9" />
            <Text style={styles.variantText}>Show variant</Text>
          </TouchableOpacity>
        </View>
      </Surface>

      <View style={styles.tabBar}>
        {[
          { id: 'examples', label: 'Examples', icon: 'format-list-bulleted' },
          { id: 'synonyms', label: 'Synonyms', icon: 'content-copy' },
          { id: 'tone', label: 'Tone', icon: 'account-voice' },
        ].map((tab) => (
          <TouchableOpacity 
            key={tab.id} 
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tabItem, activeTab === tab.id && styles.activeTabItem]}
          >
            <MaterialCommunityIcons 
              name={tab.icon} 
              size={22} 
              color={activeTab === tab.id ? '#48AAD9' : '#9ca3af'} 
            />
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.subContentContainer}>
        {renderSubContent()}
      </View>

      <Text style={styles.disclaimer}>
        Note: This translation is powered by AI and may contain inaccuracies. Review advised.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 15 },
  resultCard: { backgroundColor: '#D9D9D9', borderRadius: 25, padding: 20, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  langLabel: { color: '#4b5563', fontWeight: '600' },
  sourceText: { fontSize: 28, fontWeight: '700', color: '#1f2937', marginBottom: 15 },
  divider: { backgroundColor: '#9ca3af', height: 1, marginVertical: 15, opacity: 0.3 },
  translatedText: { fontSize: 32, fontWeight: '700', color: '#48AAD9' },
  phonetic: { fontSize: 16, color: '#6b7280', fontStyle: 'italic', marginBottom: 15 },
  meaningSection: { marginTop: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#4b5563', marginBottom: 5 },
  meaningText: { fontSize: 15, color: '#374151', lineHeight: 22 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  feedbackRow: { flexDirection: 'row' },
  feedbackBtn: { backgroundColor: '#cacad1', marginHorizontal: 2 },
  variantBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  variantText: { color: '#48AAD9', fontWeight: 'bold', marginLeft: 5 },
  pronounceIcon: { width: 24, height: 24, tintColor: '#1f2937' },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  tabItem: { alignItems: 'center', padding: 10, flex: 1 },
  activeTabItem: { borderBottomWidth: 3, borderBottomColor: '#48AAD9' },
  tabLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  activeTabLabel: { color: '#48AAD9', fontWeight: 'bold' },
  subContentContainer: { backgroundColor: '#f3f4f6', borderRadius: 20, padding: 15, minHeight: 150 },
  disclaimer: { textAlign: 'center', color: '#9ca3af', fontSize: 11, marginTop: 20, paddingBottom: 40 },
});