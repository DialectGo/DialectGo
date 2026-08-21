import { supabase } from '../../api/supabase';
import { endpoints } from '../../api/client';

const SAVE_API_URL = endpoints.DICTIONARY_SAVE;
const CHECK_SAVED_API_URL = endpoints.DICTIONARY_CHECK_SAVED;

export const dictionaryBookmarkService = {
  checkBookmarkStatus: async (id) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const response = await fetch(`${CHECK_SAVED_API_URL}/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (response.ok && result.success) {
      return result.isBookmarked;
    }
    return false;
  },

  saveWordBookmark: async (id) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Please login to save words.');
    }

    const response = await fetch(SAVE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        dictionary_id: parseInt(id),
      }),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      return true;
    } else {
      throw new Error(result.message || 'Failed to save.');
    }
  }
};
