import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { formatFullName } from '../../utils/stringUtils';

export default function ProfileHeader({ firstName, lastName, userAvatar, isGuest, streakCount }) {
  return (
    <View style={styles.profileHeader}>
      <View style={styles.avatarWrapper}>
        <Image source={userAvatar} style={styles.avatarImg} />
      </View>
      <Text style={styles.userName}>{formatFullName(firstName, lastName)}</Text>
      <Text style={styles.streakText}>
        {isGuest ? 'Sign in to accumulate streaks' : `${streakCount} days streak`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatarImg: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 15,
    fontFamily: 'Poppins-Bold',
  },
  streakText: {
    fontSize: 16,
    color: '#777',
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
});
