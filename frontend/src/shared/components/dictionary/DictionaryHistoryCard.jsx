import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function DictionaryHistoryCard({
  item,
  index,
  selectedIds,
  toggleSelect,
  router,
  styles
}) {
  const isSelected = selectedIds.has(item.id);

  return (
    <View key={item.id?.toString() || index.toString()} style={styles.cardContainer}>
      {/* Checkbox Section */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => toggleSelect(item.id)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
          {isSelected && <View style={styles.checkboxInner} />}
        </View>
      </TouchableOpacity>

      {/* History Item Card */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.historyCard}
        onPress={() => {
          router.navigate({ pathname: '/Dictionary/Dictionary', params: { search: item.search_term } });
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.wordText}>{item.search_term}</Text>
          <Text style={styles.timeText}>
            {new Date(item.created_at).toLocaleDateString()} at{' '}
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <Image
          source={require('../../../../assets/icons/nav/back_arrow.png')}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    </View>
  );
}
