import { supabase } from '../../api/supabase';
import { endpoints } from '../../api/client';

const SAVE_API_URL = endpoints.DICTIONARY_SAVE;
const CHECK_SAVED_API_URL = endpoints.DICTIONARY_CHECK_SAVED;
const GET_SAVED_API_URL = `${endpoints.DICTIONARY_BASE}/saved`;
const DELETE_MULTIPLE_API_URL = `${endpoints.DICTIONARY_BASE}/delete-multiple`;

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
  },

  getSavedWords: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const response = await fetch(GET_SAVED_API_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (result.success && result.data && result.data.data) {
      return result.data.data;
    }
    return [];
  },

  deleteSavedWords: async (ids) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(DELETE_MULTIPLE_API_URL, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete items.');
    }
    return true;
  }
};
