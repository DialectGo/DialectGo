/**
 * DialectGo — Wiki Service
 *
 * Handles all community wiki (dialect submissions) API calls.
 */
import { WIKI_API_BASE } from '../../api/client';
import { getValidSession } from '../authService';

/**
 * Fetches a paginated, filtered list of wiki submissions.
 *
 * @param {number} page - 1-based page number
 * @param {Object} filters - { sort, region, category, type, search }
 * @param {number} [limit=20] - Number of items per page
 * @returns {Promise<Object>} { data: [], pagination: { total } }
 */
export const fetchSubmissions = async (page = 1, filters = {}, limit = 20) => {
  const session = await getValidSession();

  const { sort = 'newest', region, category, type, search } = filters;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  });

  if (region && region !== 'All') params.append('region', region);
  if (category && category !== 'All') params.append('category', category);
  if (type && type !== 'All') params.append('type', type);
  if (search?.trim()) params.append('search', search.trim());

  const response = await fetch(`${WIKI_API_BASE}?${params}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  const json = await response.json();

  if (json.success) {
    return { data: json.data, pagination: json.pagination };
  }

  return { data: [], pagination: { total: 0 } };
};

/**
 * Submits a vote on a wiki submission.
 *
 * @param {string|number} submissionId - ID of the submission to vote on
 * @param {'up'|'down'} voteType - Vote direction
 * @returns {Promise<Object>} { upvotes, promoted } or null on failure
 */
export const voteSubmission = async (submissionId, voteType) => {
  const session = await getValidSession();

  const response = await fetch(`${WIKI_API_BASE}/${submissionId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ vote_type: voteType }),
  });

  const json = await response.json();
  return json.success ? json : null;
};

/**
 * Fetches a single submission's details.
 *
 * @param {string|number} id - Submission ID
 * @returns {Promise<Object>} The submission object
 */
export const fetchSubmissionDetail = async (id) => {
  const session = await getValidSession();
  const response = await fetch(`${WIKI_API_BASE}/${id}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const json = await response.json();
  return json.success ? json.data : null;
};

/**
 * Fetches comments for a submission.
 *
 * @param {string|number} id - Submission ID
 * @returns {Promise<Array>} Array of comments
 */
export const fetchSubmissionComments = async (id) => {
  const session = await getValidSession();
  const response = await fetch(`${WIKI_API_BASE}/${id}/comments`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const json = await response.json();
  return json.success ? json.data : [];
};

/**
 * Toggles a bookmark for a submission.
 *
 * @param {string|number} id - Submission ID
 * @returns {Promise<Object>} { success: true, bookmarked: boolean }
 */
export const bookmarkSubmission = async (id) => {
  const session = await getValidSession();
  const response = await fetch(`${WIKI_API_BASE}/${id}/bookmark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  const json = await response.json();
  return json.success ? json : null;
};

/**
 * Posts a new comment on a submission.
 *
 * @param {string|number} id - Submission ID
 * @param {string} content - Comment content
 * @returns {Promise<Object>} The posted comment object
 */
export const postSubmissionComment = async (id, content) => {
  const session = await getValidSession();
  const response = await fetch(`${WIKI_API_BASE}/${id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ content }),
  });
  const json = await response.json();
  return json.success ? json : null;
};
