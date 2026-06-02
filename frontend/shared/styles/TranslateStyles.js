import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  
  // HEADER SECTION
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
  },
  yellowText: {
    color: '#FBBF24',
  },
  subHeader: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },

  // NEW SELECTOR BAR (Yellow Pill Style)
  newSelectorBar: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    borderRadius: 20,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  langPill: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  langPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  newSwapButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // TRANSLATE CARDS
  translateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
  },
  resultCardExtra: {
    marginTop: 15,
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 5,
    borderLeftColor: '#FBBF24',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  mainInput: {
    flex: 1,
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  resultText: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '700',
  },
  loadingArea: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // CARD FOOTER & ICONS
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  shortcutIcons: {
    flexDirection: 'row',
  },
  iconBtn: {
    backgroundColor: '#F3F4F6',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  charCount: {
    fontSize: 10,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FBBF24',
    marginLeft: 4,
  },

  // FEEDBACK SECTION
  feedbackContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  feedbackAsk: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
    marginBottom: 15,
  },
  feedbackIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  miniFeedbackBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeYellow: {
    backgroundColor: '#FBBF24',
    borderColor: '#FBBF24',
  },

  // SUGGESTION BOX
  suggestionBox: {
    width: '100%',
    marginTop: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
  },
  suggestionInput: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 15,
  },
  yellowSubmitBtn: {
    backgroundColor: '#FBBF24',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#1F2937',
    fontWeight: '800',
    fontSize: 12,
  },

  // MODERN MODAL / BOTTOM SHEET
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  sheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetItemText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
  },
  activeSheetText: {
    color: '#FBBF24',
    fontWeight: '800',
  },
  closeSheet: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeSheetText: {
    color: '#EF4444',
    fontWeight: '700',
  },
});