import { ProgressModel } from '../models/progress.model.js';

export const getUserProgress = async (userId, gameId = 1, difficulty = 'none') =>
    await ProgressModel.getProgress(userId, gameId, difficulty);

export const getSessionOwner = async (sessionId) => await ProgressModel.getSessionById(sessionId);

// ✅ UPDATED: Supports high score updates dynamically alongside your games tracking logic
export const update = async (userId, gameId, difficulty, xpGained, scoreGained, levelCompleted) =>
    await ProgressModel.updateProgress(userId, gameId, difficulty, xpGained, scoreGained, levelCompleted);

// ✅ NEW: Links your controller cleanly down into the Model query runner
export const deductXpForHearts = async (userId, gameId, difficulty, xpCost) =>
    await ProgressModel.purchaseHeartsWithXp(userId, gameId, difficulty, xpCost);

export const fetchLeaderboard = async () => await ProgressModel.getLeaderboard();

export const registerHeartLoss = async (userId, gameId = 1, difficulty = 'none', currentHearts) =>
    await ProgressModel.consumeHeart(userId, gameId, difficulty, currentHearts);