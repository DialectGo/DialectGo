import { SessionModel } from '../models/session.model.js';

export const start = async (userId, gameId, token) => {
    return await SessionModel.startSession(userId, gameId, token);
};

export const complete = async (sessionId, accuracyScore, sessionData, token) => {
    return await SessionModel.completeSession(sessionId, accuracyScore, sessionData, token);
};