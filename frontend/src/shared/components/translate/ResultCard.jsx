import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { styles } from '../../../features/translator/styles/TranslateStyles';

export default function ResultCard({
  targetLang,
  isLoading,
  translation,
  isPlayingAudio,
  playTranslatedAudio,
  handleCopy,
  isCopied,
  setRateModalVisible,
  feedback,
  setMoreMenuVisible,
}) {
  return (
    <View style={[styles.translateCard, styles.resultCardExtra]}>
      <View style={styles.cardHeader}>
        <Text style={styles.inputLabel}>{targetLang.toUpperCase()}</Text>
      </View>
      {isLoading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="small" color="#FBBF24" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Text style={styles.resultText}>{translation || "Waiting..."}</Text>
          {translation ? (
            <View style={styles.outputToolbar}>
              <TouchableOpacity
                onPress={() => playTranslatedAudio(translation, targetLang)}
                style={styles.outputToolbarBtn}
              >
                <Ionicons
                  name={isPlayingAudio ? 'volume-high' : 'volume-medium-outline'}
                  size={20}
                  color={isPlayingAudio ? '#FBBF24' : '#1F2937'}
                />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={handleCopy} style={[styles.outputToolbarBtn, { marginRight: 10 }]}>
                  <Ionicons name={isCopied ? "checkmark" : "copy-outline"} size={20} color={isCopied ? "#10B981" : "#1F2937"} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRateModalVisible(true)}
                  style={[styles.outputToolbarBtn, { marginRight: 10 }]}
                >
                  <MaterialIcons
                    name="thumbs-up-down"
                    size={20}
                    color={feedback ? '#FBBF24' : '#1F2937'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setMoreMenuVisible(true)}
                  style={styles.outputToolbarBtn}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color="#1F2937" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
