/**
 * DialectGo — Game Service
 *
 * Handles game progression tracking and session management API calls.
 */
import { API_API_BASE } from '../api/client';
import { getValidSession } from './authService';

/**
 * Fetches the user's progression data for a specific game and difficulty.
 *
 * @param {number} gameId - The game's ID (e.g., 2 for WordBridge)
 * @param {string} [difficulty='hard'] - Difficulty level
 * @returns {Promise<Object|null>} Progression data or null on failure
 */
export const fetchGameProgress = async (gameId, difficulty = 'hard') => {
  const session = await getValidSession();

  const response = await fetch(
    `${API_API_BASE}/progress/me?game_id=${gameId}&difficulty=${difficulty}`,
    {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }
  );

  const result = await response.json();
  return result.success && result.data ? result.data : null;
};

/**
 * Starts a new game session and returns the session ID.
 *
 * @param {number} gameId - The game's ID
 * @returns {Promise<string|null>} The session ID string, or null on failure
 */
export const startGameSession = async (gameId) => {
  const session = await getValidSession();

  const response = await fetch(`${API_API_BASE}/sessions/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ game_id: gameId }),
  });

  const resData = await response.json();

  if (response.ok && resData.success && resData.data) {
    return resData.data.session_id;
  }

  throw new Error(resData.message || 'Could not start game session');
};
