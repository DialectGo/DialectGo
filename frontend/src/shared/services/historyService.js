/**
 * DialectGo — History Service
 *
 * Handles all translation history API calls.
 */
import { TRANSLATION_API_BASE } from '../api/client';
import { getValidSession } from './authService';

const PAGE_SIZE = 10;

/**
 * Fetches a paginated list of the user's translation history.
 *
 * @param {number} page - Zero-based page index
 * @param {number} [limit] - Number of records per page (default 10)
 * @returns {Promise<Object[]>} Array of history records
 */
export const fetchHistory = async (page = 0, limit = PAGE_SIZE) => {
  const session = await getValidSession();

  const response = await fetch(
    `${TRANSLATION_API_BASE}/history?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json',
      },
    }
  );

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const textError = await response.text();
    throw new Error(`Server error: ${textError}`);
  }

  const json = await response.json();
  return json.success && Array.isArray(json.data) ? json.data : [];
};
