import express from 'express';
import {
    listSubmissions,
    getSubmission,
    createSubmission,
    voteOnSubmission,
} from '../controllers/wiki.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { validateWikiSubmission, validateWikiVote } from '../middlewares/validate.middleware.js';

const router = express.Router();

// GET  /api/wiki          — Paginated feed with filters
router.get('/', verifyToken, listSubmissions);

// GET  /api/wiki/:id      — Single submission detail
router.get('/:id', verifyToken, getSubmission);

// POST /api/wiki          — Create a new submission
router.post('/', verifyToken, validateWikiSubmission, createSubmission);

// POST /api/wiki/:id/vote — Upvote or downvote
router.post('/:id/vote', verifyToken, validateWikiVote, voteOnSubmission);

export default router;
