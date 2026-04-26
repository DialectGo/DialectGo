import { ProgressModel } from '../models/progress.model.js';

export const getUserProgress = async (userId) => await ProgressModel.getProgress(userId);

export const getSessionOwner = async (sessionId) => await ProgressModel.getSessionById(sessionId);

export const update = async (userId, xpGained) => await ProgressModel.updateProgress(userId, xpGained);

export const fetchLeaderboard = async () => await ProgressModel.getLeaderboard();