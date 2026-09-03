import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/theme/colorPalette';
import { fonts } from '../../../shared/theme/typography';
import { availableAvatars } from '../../../shared/hooks/profile/constants';

/**
 * SavedProfileCard — Displays a saved profile for quick login
 */
export default function SavedProfileCard({ profile, onPress, onManage, isManageMode = false }) {
  // Find the matching avatar source from constants, default to maria_clara
  const avatarObj = availableAvatars.find(a => a.name === profile.avatar_url) || availableAvatars[0];
  
  // Format the name
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={isManageMode ? undefined : () => onPress(profile)}
      activeOpacity={isManageMode ? 1 : 0.7}
    >
      <View style={styles.leftContent}>
        {/* If in Manage Mode, show the red delete button */}
        {isManageMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={() => onManage(profile)}>
            <View style={styles.minusIconContainer}>
              <View style={styles.minusLine} />
            </View>
          </TouchableOpacity>
        )}

        {/* Avatar */}
        <Image source={avatarObj.source} style={styles.avatar} resizeMode="cover" />
        
        {/* Name & Email (in manage mode) */}
        <View style={styles.textContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {fullName}
          </Text>
          {isManageMode && (
            <Text style={styles.emailText} numberOfLines={1}>
              {profile.email}
            </Text>
          )}
        </View>
      </View>

      {/* Chevron (only in normal mode) */}
      {!isManageMode && (
        <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDE7', // DialectGo light yellow
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFD54F', // Strong yellow border
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deleteButton: {
    marginRight: 16,
  },
  minusIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4D4D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minusLine: {
    width: 12,
    height: 2,
    backgroundColor: '#FFF',
    borderRadius: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#5D4037', // DialectGo dark brown text
  },
  emailText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#8D6E63', // Lighter brown
    marginTop: 2,
  },
});
