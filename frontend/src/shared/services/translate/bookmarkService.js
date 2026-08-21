import { TRANSLATION_API_BASE } from '../../api/client';
import { getValidSession } from '../authService';

/**
 * Toggles the bookmark status for a given translation history item.
 * 
 * @param {string|number} translationId - The ID of the translation record
 * @returns {Promise<Object>} The updated bookmark status
 */
export const toggleBookmarkTranslation = async (translationId) => {
    const session = await getValidSession();

    const response = await fetch(`${TRANSLATION_API_BASE}/${translationId}/bookmark`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const textError = await response.text();
        throw new Error(`Server error: ${textError}`);
    }

    const json = await response.json();
    if (!json.success && !json.bookmarked) {
        throw new Error(json.message || 'Failed to toggle bookmark');
    }
    
    return json;
};
