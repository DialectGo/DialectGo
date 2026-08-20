import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SwipeableBottomSheet from '../SwipeableBottomSheet';
import { styles } from '../../../features/translator/styles/TranslateStyles';
import { LANGUAGES } from '../../hooks/translate/constants';

export default function TranslateActionSheets({
  rateModalVisible,
  setRateModalVisible,
  handleQuickRating,
  feedback,

  moreMenuVisible,
  setMoreMenuVisible,
  setFeedbackModalVisible,
  handleShowBreakdown,
  setShowCustomize,

  modalVisible,
  setModalVisible,
  selectingFor,
  sourceLang,
  targetLang,
  selectLanguage,
}) {
  return (
    <>
      <SwipeableBottomSheet visible={rateModalVisible} onClose={() => setRateModalVisible(false)}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 20 }}>Rate this translation</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => { handleQuickRating(5); setRateModalVisible(false); }}
            style={[styles.rateBtn, feedback === 'like' && styles.rateBtnActive]}
          >
            <Ionicons name="thumbs-up" size={26} color={feedback === 'like' ? '#FBBF24' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { handleQuickRating(1); setRateModalVisible(false); }}
            style={[styles.rateBtn, feedback === 'unlike' && styles.rateBtnActive]}
          >
            <Ionicons name="thumbs-down" size={26} color={feedback === 'unlike' ? '#FBBF24' : '#6B7280'} />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
          Your feedback will be used to help improve the product
        </Text>
      </SwipeableBottomSheet>

      <SwipeableBottomSheet visible={moreMenuVisible} onClose={() => setMoreMenuVisible(false)}>
        <TouchableOpacity
          style={styles.moreMenuItem}
          onPress={() => { setMoreMenuVisible(false); setFeedbackModalVisible(true); }}
        >
          <Ionicons name="create-outline" size={22} color="#374151" />
          <Text style={styles.moreMenuText}>Suggest Translation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreMenuItem}
          onPress={() => { setMoreMenuVisible(false); handleShowBreakdown(); }}
        >
          <Ionicons name="analytics-outline" size={22} color="#374151" />
          <Text style={styles.moreMenuText}>Breakdown</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreMenuItem}
          onPress={() => { setMoreMenuVisible(false); setShowCustomize(true); }}
        >
          <Ionicons name="color-wand-outline" size={22} color="#374151" />
          <Text style={styles.moreMenuText}>Customize</Text>
        </TouchableOpacity>
      </SwipeableBottomSheet>

      <SwipeableBottomSheet visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text style={styles.sheetTitle}>Select Language</Text>
        {LANGUAGES.map((item) => (
          <TouchableOpacity key={item.id} style={styles.sheetItem} onPress={() => selectLanguage(item)}>
            <Text style={[styles.sheetItemText, (selectingFor === 'source' ? sourceLang : targetLang) === item.name && styles.activeSheetText]}>
              {item.name}
            </Text>
            {(selectingFor === 'source' ? sourceLang : targetLang) === item.name && <Ionicons name="checkmark-circle" size={22} color="#FBBF24" />}
          </TouchableOpacity>
        ))}
      </SwipeableBottomSheet>
    </>
  );
}
