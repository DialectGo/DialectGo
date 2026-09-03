import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colorPalette';
import { fonts } from '../theme/typography';

/**
 * LogoutConfirmModal — Facebook-style logout confirmation.
 * Asks whether the user wants to save their login info before logging out.
 */
export default function LogoutConfirmModal({
  visible,
  onSaveAndLogout,
  onLogoutWithoutSaving,
  onCancel,
  isSaving = false,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="log-out-outline" size={32} color={colors.primaryDark} />
          </View>

          {/* Title & Message */}
          <Text style={styles.title}>Log Out</Text>
          <Text style={styles.message}>
            Do you want to save your login info so you can log back in faster next time?
          </Text>

          {/* Buttons */}
          <View style={styles.buttonColumn}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={onSaveAndLogout}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save & Log Out</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={onLogoutWithoutSaving}
              disabled={isSaving}
            >
              <Text style={styles.logoutButtonText}>Log Out Without Saving</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isSaving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonColumn: {
    width: '100%',
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  logoutButton: {
    backgroundColor: colors.surfaceGray,
  },
  logoutButtonText: {
    color: colors.textDark,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  cancelButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  cancelText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
});
