import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { endpoints } from '../../api/client';
import { getValidSession } from '../authService';

const DEVICE_ID_KEY = 'dialectgo_device_id';

/**
 * Get or generate a persistent device UUID.
 * Stored in SecureStore (survives reinstall on iOS via Keychain,
 * and on Android if backup is enabled).
 */
export const getDeviceId = async () => {
  try {
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Failed to get/create device ID:', error);
    // Fallback: generate a UUID but it won't persist across reinstalls
    return Crypto.randomUUID();
  }
};

/**
 * Save the current user's profile to this device's saved profiles list.
 * Requires an active auth session.
 */
export const saveProfileToDevice = async ({ email, first_name, last_name, avatar_url, auth_provider }) => {
  try {
    const session = await getValidSession();
    if (!session) return null;

    const deviceId = await getDeviceId();

    const response = await fetch(endpoints.DEVICE_PROFILES_SAVE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_id: deviceId,
        email,
        first_name,
        last_name,
        avatar_url,
        auth_provider: auth_provider || 'email',
      }),
    });

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to save device profile:', error);
    return null;
  }
};

/**
 * Get all saved profiles for this device.
 * Does NOT require auth (pre-login screen).
 */
export const getSavedProfiles = async () => {
  try {
    const deviceId = await getDeviceId();
    const url = endpoints.DEVICE_PROFILES_GET(deviceId);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Failed to get saved profiles:', error);
    return [];
  }
};

/**
 * Remove a saved profile from this device.
 * Does NOT require auth (pre-login removal).
 */
export const removeProfileFromDevice = async (userId) => {
  try {
    const deviceId = await getDeviceId();
    const url = endpoints.DEVICE_PROFILES_REMOVE(deviceId, userId);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to remove device profile:', error);
    return false;
  }
};
