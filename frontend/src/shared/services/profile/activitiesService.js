/**
 * DialectGo — Activities Service
 *
 * Handles all user activity API calls (posts, translations, comments, bookmarks).
 */
import { ACTIVITIES_API_BASE } from '../../api/client';
import { getValidSession } from '../authService';

/**
 * Fetches all activity categories for the current user.
 *
 * @returns {Promise<Object>} Object with { posts, translations, comments, bookmarks } arrays
 */
export const fetchActivities = async () => {
  const session = await getValidSession();

  const response = await fetch(ACTIVITIES_API_BASE, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  const json = await response.json();

  if (json.success) {
    return {
      posts: json.data.posts || [],
      translations: json.data.translations || [],
      comments: json.data.comments || [],
      bookmarks: json.data.bookmarks || [],
    };
  }

  return { posts: [], translations: [], comments: [], bookmarks: [] };
};
