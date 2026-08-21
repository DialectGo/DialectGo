import { supabase } from '../../api/supabase';
import { endpoints } from '../../api/client';

export const dictionaryHistoryService = {
  getDictionaryHistory: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const response = await fetch(endpoints.DICTIONARY_HISTORY, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    return [];
  },

  deleteDictionaryHistory: async (ids) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(endpoints.DICTIONARY_HISTORY_DELETE, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids: Array.from(ids) })
    });

    if (!response.ok) {
      throw new Error('Failed to delete history items.');
    }
    return true;
  }
};
