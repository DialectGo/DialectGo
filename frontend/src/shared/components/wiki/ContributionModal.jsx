import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';

const ContributionModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  feedbackComment, 
  setFeedbackComment, 
  suggestedTranslation, 
  setSuggestedTranslation 
}) => {
  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide" 
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.detailedSheetContainer}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Suggest a regional version</Text>
            
            <Text style={styles.inputLabel}>OPTIONAL COMMENT</Text>
            <TextInput
              style={[styles.commentInput, { minHeight: 80 }]}
              placeholder="e.g., Translation feels too formal..."
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>SUGGEST BETTER TRANSLATION</Text>
            <TextInput
              style={[styles.commentInput, { minHeight: 80 }]}
              placeholder="How would you translate this?"
              value={suggestedTranslation}
              onChangeText={setSuggestedTranslation}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
              <Text style={styles.submitBtnText}>SUBMIT CONTRIBUTION</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
              <Text style={styles.cancelLinkText}>Maybe Later</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  detailedSheetContainer: {
    backgroundColor: '#FFF',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '85%',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 40,
  },
  sheetHandle: { 
    width: 40, 
    height: 5, 
    backgroundColor: '#E5E7EB', 
    borderRadius: 10, 
    alignSelf: 'center', 
    marginBottom: 20 
  },
  sheetTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1F2937', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  inputLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#9CA3AF', 
    marginBottom: 8, 
    marginTop: 15 
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  submitBtn: {
    backgroundColor: '#FBBF24',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 25
  },
  submitBtnText: { fontWeight: '800', color: '#000' },
  cancelLink: { marginTop: 15, alignItems: 'center' },
  cancelLinkText: { color: '#9CA3AF', fontWeight: '600' }
});

export default ContributionModal;