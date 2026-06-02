import { ProgressModel } from '../models/progress.model.js';

export const getUserProgress = async (userId) => await ProgressModel.getProgress(userId);

export const getSessionOwner = async (sessionId) => await ProgressModel.getSessionById(sessionId);

// ✅ UPDATED: Supports high score updates dynamically alongside your games tracking logic
export const update = async (userId, xpGained, scoreGained) => 
    await ProgressModel.updateProgress(userId, xpGained, scoreGained);

// ✅ NEW: Links your controller cleanly down into the Model query runner
export const deductXpForHearts = async (userId, xpCost) => 
    await ProgressModel.purchaseHeartsWithXp(userId, xpCost);

export const fetchLeaderboard = async () => await ProgressModel.getLeaderboard();

export const registerHeartLoss = async (userId, currentHearts) => 
    await ProgressModel.consumeHeart(userId, currentHearts);