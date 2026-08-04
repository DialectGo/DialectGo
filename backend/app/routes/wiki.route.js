import express from 'express';
import {
    listSubmissions,
    getSubmission,
    createSubmission,
    voteOnSubmission,
    getComments,
    addComment,
    toggleBookmark,
    askAssistant,
    askGlobalAssistant,
} from '../controllers/wiki.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import {
    validateWikiSubmission,
    validateWikiVote,
    validateWikiComment,
    validateWikiAsk,
    validateGlobalWikiAsk,
} from '../middlewares/validate.middleware.js';

const router = express.Router();

// GET  /api/wiki          — Paginated feed with filters
router.get('/', verifyToken, listSubmissions);

// GET  /api/wiki/:id      — Single submission detail
router.get('/:id', verifyToken, getSubmission);

// POST /api/wiki          — Create a new submission
router.post('/', verifyToken, validateWikiSubmission, createSubmission);

// POST /api/wiki/:id/vote — Upvote or downvote
router.post('/:id/vote', verifyToken, validateWikiVote, voteOnSubmission);

// GET  /api/wiki/:id/comments — Fetch comments
router.get('/:id/comments', verifyToken, getComments);

// POST /api/wiki/:id/comments — Add a comment
router.post('/:id/comments', verifyToken, validateWikiComment, addComment);

// POST /api/wiki/:id/bookmark — Toggle bookmark
router.post('/:id/bookmark', verifyToken, toggleBookmark);

// POST /api/wiki/:id/ask — Ask the AI assistant
router.post('/:id/ask', verifyToken, validateWikiAsk, askAssistant);

// POST /api/wiki/ask-global — Ask the global AI assistant
router.post('/ask-global', verifyToken, validateGlobalWikiAsk, askGlobalAssistant);

export default router;
