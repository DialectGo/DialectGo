import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import RefreshContainer from '../../shared/components/RefreshContainer';
import ProfileTopBar from '../../components/ProfileTopBar';
import { useDictionarySaveWords } from '../../shared/hooks/dictionary/useDictionarySaveWords';
import DictionarySaveWordsCard from '../../shared/components/dictionary/DictionarySaveWordsCard';
import ConfirmOverlay from '../../shared/components/ConfirmOverlay';

export default function SaveWordsScreen() {
  const router = useRouter();
  
  const {
    bookmarks,
    loading,
    refreshing,
    selectedIds,
    isDeleting,
    handleRefresh,
    toggleSelect,
    toggleSelectAll,
    confirmDelete,
    showConfirmModal,
    setShowConfirmModal,
    processDeletion
  } = useDictionarySaveWords();

  const renderItem = (item, index) => {
    return (
      <DictionarySaveWordsCard
        key={item.id?.toString() || index.toString()}
        item={item}
        index={index}
        selectedIds={selectedIds}
        toggleSelect={toggleSelect}
        router={router}
        styles={styles}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ProfileTopBar title="Saved Words" />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFD54F" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <RefreshContainer
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={styles.listContainer}
          >
            {bookmarks.length > 0 ? (
              <View style={{ paddingBottom: 40 }}>
                {bookmarks.map((item, index) => renderItem(item, index))}
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No saved words found.</Text>
              </View>
            )}
          </RefreshContainer>

          {/* FOOTER FIXED SELECTION NAVIGATION */}
          {bookmarks.length > 0 && (
            <View style={styles.footerNav}>
              <TouchableOpacity style={styles.selectAllContainer} onPress={toggleSelectAll}>
                <View style={[styles.checkbox, selectedIds.size === bookmarks.length && styles.checkboxActive]}>
                  {selectedIds.size === bookmarks.length && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.selectAllText}>All</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.deleteBtn, selectedIds.size === 0 && styles.deleteBtnDisabled]} 
                onPress={confirmDelete}
                disabled={selectedIds.size === 0 || isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.deleteBtnText}>Delete ({selectedIds.size})</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      <ConfirmOverlay 
        visible={showConfirmModal}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${selectedIds.size} saved word(s)?`}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={processDeletion}
        isConfirming={isDeleting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  backImg: { width: 24, height: 24, tintColor: '#421C00' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFB800' },
  listContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 120, // Bottom spacing provides clearing space above absolute footer bar coords
    flexGrow: 1 
  },
  cardContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  checkboxContainer: { paddingRight: 10 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#FFB800', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#FFB800' },
  checkboxInner: { width: 10, height: 10, backgroundColor: '#FFF', borderRadius: 2 },
  card: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 15, flexDirection: 'row', elevation: 2 },
  wordText: { fontSize: 18, fontWeight: 'bold', color: '#421C00' },
  translationText: { color: '#8E8E8E', fontSize: 13 },
  rightSection: { alignItems: 'flex-end' },
  posTag: { fontSize: 9, color: '#FFB800' },
  starIcon: { width: 16, height: 16, tintColor: '#FFD54F', marginTop: 5 },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyStateText: { color: '#8E8E8E', fontSize: 15, textAlign: 'center' },
  footerNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  selectAllContainer: { flexDirection: 'row', alignItems: 'center' },
  selectAllText: { marginLeft: 10, fontSize: 16, color: '#421C00', fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FF5252', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },
  deleteBtnDisabled: { backgroundColor: '#FFCDD2' },
  deleteBtnText: { color: '#FFF', fontWeight: 'bold' }
});
