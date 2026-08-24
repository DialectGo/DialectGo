import React from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const REGIONS = ['All', 'Batangueño', 'Boholano', 'General Cebuano', 'General Tagalog'];
const CATEGORIES = ['All', 'Slang', 'Idiom', 'Colloquial', 'Literal'];
const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Voted', value: 'most_voted' },
  { label: 'Verified', value: 'verified' },
];
const TYPE_FILTERS = ['All', 'Term', 'Question'];

export default function WikiFeedFilters({
  insets,
  search,
  setSearch,
  activeRegion,
  setActiveRegion,
  activeCategory,
  setActiveCategory,
  activeSort,
  setActiveSort,
  activeType,
  setActiveType,
  showFilterMenu,
  setShowFilterMenu,
  total,
  styles
}) {
  const filterLabel =
    activeRegion !== 'All'
      ? activeRegion
      : activeCategory !== 'All'
      ? activeCategory
      : 'Filters';

  return (
    <View style={[styles.headerArea, { paddingTop: insets.top + 65 }]}>
      {/* TYPE TABS */}
      <View style={styles.typeTabs}>
        {TYPE_FILTERS.map(type => {
          const active = activeType === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.typeTab, active && styles.typeTabActive]}
              onPress={() => setActiveType(type)}
            >
              {type === 'Question' && (
                <Ionicons name="help-circle-outline" size={15} color={active ? '#4F3422' : '#9CA3AF'} />
              )}
              {type === 'Term' && (
                <Ionicons name="text-outline" size={15} color={active ? '#4F3422' : '#9CA3AF'} />
              )}
              <Text style={[styles.typeTabText, active && styles.typeTabTextActive]}>
                {type === 'All' ? 'All Posts' : `${type}s`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={19} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search terms or translations..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={19} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTER / SORT ROW */}
      <View style={styles.filterControlRow}>
        <FlatList
          data={REGIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={styles.regionList}
          renderItem={({ item }) => {
            const active = activeRegion === item;
            return (
              <TouchableOpacity
                style={[styles.regionPill, active && styles.regionPillActive]}
                onPress={() => setActiveRegion(item)}
              >
                <Text style={[styles.regionPillText, active && styles.regionPillTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* SECONDARY CONTROLS */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity
          style={[styles.filterButton, activeCategory !== 'All' && styles.filterButtonActive]}
          onPress={() => setShowFilterMenu(!showFilterMenu)}
        >
          <Ionicons name="options-outline" size={16} color="#4F3422" />
          <Text style={styles.filterButtonText}>{filterLabel}</Text>
          <Ionicons name={showFilterMenu ? 'chevron-up' : 'chevron-down'} size={15} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.sortContainer}>
          {SORTS.map(sort => {
            const active = activeSort === sort.value;
            return (
              <TouchableOpacity
                key={sort.value}
                style={[styles.sortButton, active && styles.sortButtonActive]}
                onPress={() => setActiveSort(sort.value)}
              >
                <Text style={[styles.sortButtonText, active && styles.sortButtonTextActive]}>
                  {sort.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* CATEGORY MENU */}
      {showFilterMenu && (
        <View style={styles.categoryMenu}>
          {CATEGORIES.map(category => {
            const active = activeCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={styles.categoryOption}
                onPress={() => {
                  setActiveCategory(category);
                  setShowFilterMenu(false);
                }}
              >
                <Text style={[styles.categoryOptionText, active && styles.categoryOptionActive]}>
                  {category}
                </Text>
                {active && <Ionicons name="checkmark" size={17} color="#D97706" />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* COUNT */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {total} {total === 1 ? 'entry' : 'entries'}
        </Text>
        <View style={styles.countLine} />
      </View>
    </View>
  );
}
