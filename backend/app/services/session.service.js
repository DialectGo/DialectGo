import { SessionModel } from '../models/session.model.js';

export const start = async (userId, gameId) => {
    return await SessionModel.startSession(userId, gameId);
};

export const complete = async (sessionId, accuracyScore, sessionData) => {
    return await SessionModel.completeSession(sessionId, accuracyScore, sessionData);
};