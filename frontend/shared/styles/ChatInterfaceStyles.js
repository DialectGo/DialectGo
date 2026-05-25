import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
    flexGrow: 1,
  },

  welcomeSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFCB45',
    textAlign: 'center',
    lineHeight: 36,
  },

  welcomeSub: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#666666',
  },

  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  chip: {
    backgroundColor: '#FFCB45',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,

    elevation: 3,
  },

  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },

  textInput: {
    flex: 1,
    minHeight: 50,
    maxHeight: 120,

    backgroundColor: '#F5F5F5',
    borderRadius: 25,

    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,

    fontSize: 15,
    color: '#333333',
  },

  sendBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,

    backgroundColor: '#FFCB45',

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 10,

    shadowColor: '#FFCB45',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,

    elevation: 4,
  },

  sendIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  typingText: {
    marginLeft: 10,
    color: '#666666',
    fontSize: 14,
  },
});