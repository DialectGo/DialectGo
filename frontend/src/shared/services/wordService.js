import AsyncStorage from '@react-native-async-storage/async-storage';
import { endpoints } from '../api/client';
import { getValidSession } from './authService';
import { parseJsonResponse } from '../utils/apiUtils';

const WORD_API = endpoints.WORD_OF_DAY;

/**
 * Fetches the Word of the Day.
 * Handles 24-hour local caching using AsyncStorage.
 * 
 * @param {boolean} forceRefresh - If true, bypasses the local cache
 * @returns {Promise<Object>} The formatted word of the day object, or null on failure
 */
export const fetchDailyWord = async (forceRefresh = false) => {
  try {
    const session = await getValidSession();
    const userId = session.user.id;
    const storageKey = `word_of_the_day_${userId}`;
    const now = Date.now();

    // Skip cache verification check if the user physically triggers a pull refresh action
    if (!forceRefresh) {
      const storedData = await AsyncStorage.getItem(storageKey);
      if (storedData) {
        const { data, timestamp } = JSON.parse(storedData);
        if (now - timestamp < 86400000) {
          return data;
        }
      }
    }

    const response = await fetch(WORD_API, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await parseJsonResponse(response);
    if (result.success && result.data) {
      const raw = result.data;
      const translations = raw.translations || [];
      const englishEntry = translations.find(t => t.target_entry.language_id === 1)?.target_entry;
      const tagalogEntry = translations.find(t => t.target_entry.language_id === 2)?.target_entry;

      const formattedWord = {
        term: raw.word_term,
        translation: englishEntry?.word_term || null,
        definition: englishEntry?.definition || 'No definition available',
        usageCeb: raw.example_usage,
        usageEng: englishEntry?.example_usage,
        usageTag: tagalogEntry?.example_usage
      };

      await AsyncStorage.setItem(storageKey, JSON.stringify({
        data: formattedWord,
        timestamp: now
      }));
      
      return formattedWord;
    }
    return null;
  } catch (error) {
    console.error("Daily word error:", error);
    return null;
  }
};
