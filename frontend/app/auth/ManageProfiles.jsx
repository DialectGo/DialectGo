import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getSavedProfiles, removeProfileFromDevice } from '../../src/shared/services/profile/deviceProfileService';
import SavedProfileCard from '../../src/features/auth/components/SavedProfileCard';
import ConfirmOverlay from '../../src/shared/components/ConfirmOverlay';
import { colors } from '../../src/shared/theme/colorPalette';
import { fonts } from '../../src/shared/theme/typography';

export default function ManageProfiles() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Confirm modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [profileToRemove, setProfileToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const data = await getSavedProfiles();
    setProfiles(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handlePromptRemove = (profile) => {
    setProfileToRemove(profile);
    setConfirmVisible(true);
  };

  const handleConfirmRemove = async () => {
    if (!profileToRemove) return;
    setIsRemoving(true);
    const success = await removeProfileFromDevice(profileToRemove.user_id);
    setIsRemoving(false);
    setConfirmVisible(false);
    
    if (success) {
      setProfiles(prev => prev.filter(p => p.user_id !== profileToRemove.user_id));
      setProfileToRemove(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Accounts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : profiles.length === 0 ? (
          <Text style={styles.emptyText}>No saved accounts found.</Text>
        ) : (
          profiles.map((profile) => (
            <SavedProfileCard
              key={profile.user_id}
              profile={profile}
              isManageMode={true}
              onManage={handlePromptRemove}
            />
          ))
        )}
      </ScrollView>

      {/* Done Button matches Duolingo's text color */}
      <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
        <Text style={styles.doneButtonText}>DONE EDITING</Text>
      </TouchableOpacity>

      <ConfirmOverlay
        visible={confirmVisible}
        title="Remove Account"
        message={profileToRemove ? `Remove ${profileToRemove.first_name || profileToRemove.email}'s account from this device?` : ''}
        confirmText="Remove"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleConfirmRemove}
        isConfirming={isRemoving}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Maintain white background
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: '#5D4037', // Dark brown to contrast with white
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  emptyText: {
    fontFamily: fonts.medium,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  doneButton: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#FFC107', // Yellow color
    letterSpacing: 1,
    fontWeight: 'bold',
  },
});
