import { ProgressModel } from '../models/progress.model.js';

export const getUserProgress = async (userId, gameId = 1, difficulty = 'none', token) =>
    await ProgressModel.getProgress(userId, gameId, difficulty, token);

export const getSessionOwner = async (sessionId, token) => await ProgressModel.getSessionById(sessionId, token);

// ✅ UPDATED: Supports high score updates dynamically alongside your games tracking logic
export const update = async (userId, gameId, difficulty, xpGained, scoreGained, levelCompleted, token) =>
    await ProgressModel.updateProgress(userId, gameId, difficulty, xpGained, scoreGained, levelCompleted, token);

// ✅ NEW: Links your controller cleanly down into the Model query runner
export const deductXpForHearts = async (userId, gameId, difficulty, xpCost, token) =>
    await ProgressModel.purchaseHeartsWithXp(userId, gameId, difficulty, xpCost, token);

export const fetchLeaderboard = async (token) => await ProgressModel.getLeaderboard(token);

export const registerHeartLoss = async (userId, gameId = 1, difficulty = 'none', currentHearts, token) =>
    await ProgressModel.consumeHeart(userId, gameId, difficulty, currentHearts, token);