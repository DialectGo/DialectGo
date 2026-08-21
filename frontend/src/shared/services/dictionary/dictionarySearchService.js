import { supabase } from '../../api/supabase';
import { endpoints } from '../../api/client';

export const searchDictionary = async (term) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            throw new Error('Authentication Required. Please log in to search.');
        }

        const response = await fetch(
            `${endpoints.DICTIONARY_SEARCH}/${encodeURIComponent(term)}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            return result.data;
        } else {
            return [];
        }
    } catch (err) {
        console.error('Search Error:', err);
        throw err;
    }
};
