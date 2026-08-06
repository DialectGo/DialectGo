import { WikiModel } from '../models/wiki.model.js';
import { askWikiAssistant, askGlobalWikiAssistant } from './metaLayer.service.js';

const PROMOTION_THRESHOLD = 10; // Net upvotes needed for auto-promotion

/**
 * Business logic layer for the DialectWiki feature.
 */
export const WikiService = {

    /**
     * List submissions with pagination and filters.
     */
    listSubmissions: async (token, query) => {
        const filters = {
            page: parseInt(query.page) || 1,
            limit: Math.min(parseInt(query.limit) || 20, 50), // Cap at 50
            region: query.region || null,
            category: query.category || null,
            status: query.status || null,
            search: query.search || null,
            sort: query.sort || 'newest',
            type: query.type || null,
        };

        return await WikiModel.getSubmissions(token, filters);
    },

    /**
     * Get a single submission with the current user's vote and bookmark state.
     */
    getDetail: async (submissionId, userId, token) => {
        const { data: submission, error } = await WikiModel.getSubmissionById(token, submissionId);

        if (error || !submission) {
            return { data: null, error: error || new Error('Not found') };
        }

        // Fetch the user's current vote on this submission
        let userVote = null;
        let bookmarked = false;
        if (userId && token) {
            const { data: voteData } = await WikiModel.getUserVote(token, submissionId, userId);
            userVote = voteData?.vote_type || null;

            const { bookmarked: isBookmarked } = await WikiModel.checkBookmark(token, userId, submissionId);
            bookmarked = isBookmarked;
        }

        return {
            data: { ...submission, userVote, bookmarked },
            error: null,
        };
    },

    /**
     * Submit a new term or question. Checks for duplicates first (only for Terms).
     */
    submitTerm: async (token, userId, data) => {
        // Only check duplicates for Term type submissions
        if (data.type !== 'Question') {
            const { exists } = await WikiModel.checkDuplicate(token, data.source_term, data.region);
            if (exists) {
                return {
                    data: null,
                    error: { message: 'A similar term for this region already exists.' },
                    status: 409,
                };
            }
        }

        const { data: submission, error } = await WikiModel.createSubmission(token, userId, data);

        if (error) {
            return { data: null, error, status: 500 };
        }

        return { data: submission, error: null, status: 201 };
    },

    /**
     * Cast or toggle a vote on a submission.
     * 
     * Logic:
     * - No existing vote → insert new vote
     * - Same direction as existing → remove vote (toggle off)
     * - Opposite direction → update vote (flip)
     * 
     * After any change, recalculates upvotes and checks promotion threshold.
     */
    castVote: async (token, submissionId, userId, voteType) => {
        // 1. Check current vote
        const { data: existingVote } = await WikiModel.getUserVote(token, submissionId, userId);

        if (existingVote) {
            if (existingVote.vote_type === voteType) {
                // Same direction → remove vote (toggle off)
                await WikiModel.removeVote(token, submissionId, userId);
            } else {
                // Opposite direction → flip vote
                await WikiModel.upsertVote(token, submissionId, userId, voteType);
            }
        } else {
            // No existing vote → insert new
            await WikiModel.upsertVote(token, submissionId, userId, voteType);
        }

        // 2. Recalculate the net upvote count
        const { upvotes, error } = await WikiModel.recalculateUpvotes(token, submissionId);

        if (error) {
            return { upvotes: 0, promoted: false, error };
        }

        // 3. Check if this pushes the submission past the promotion threshold
        let promoted = false;
        if (upvotes >= PROMOTION_THRESHOLD) {
            // Fetch current status to avoid re-promoting
            const { data: submission } = await WikiModel.getSubmissionById(token, submissionId);
            if (submission && submission.status !== 'verified') {
                const { error: promoError } = await WikiModel.promoteToCorpus(token, submissionId);
                if (!promoError) {
                    promoted = true;
                    console.log(`[WikiService] 🎉 Submission ${submissionId} auto-promoted (${upvotes} upvotes)`);
                }
            }
        }

        return { upvotes, promoted, error: null };
    },

    // ─── Comments ────────────────────────────────────────────────────────────

    /**
     * Get all comments for a submission.
     */
    getComments: async (token, submissionId) => {
        return await WikiModel.getComments(token, submissionId);
    },

    /**
     * Add a comment to a submission.
     */
    addComment: async (token, userId, submissionId, content) => {
        const { data, error } = await WikiModel.addComment(token, userId, submissionId, content);

        if (error) {
            return { data: null, error };
        }

        // Fetch the author profile for the response
        return { data, error: null };
    },

    // ─── Bookmarks ───────────────────────────────────────────────────────────

    /**
     * Toggle bookmark for a submission.
     */
    toggleBookmark: async (token, userId, submissionId) => {
        return await WikiModel.toggleBookmark(token, userId, submissionId);
    },

    // ─── AI Assistant ────────────────────────────────────────────────────────

    /**
     * Ask the AI assistant about a specific submission.
     * Fetches the full submission data to provide context.
     */
    askAssistant: async (submissionId, userMessage, conversationHistory) => {
        // Fetch the submission to provide context
        const { data: submission, error } = await WikiModel.getSubmissionById(null, submissionId); // No token needed for assistant context

        if (error || !submission) {
            return {
                success: false,
                response: 'Could not find the submission to provide context.',
            };
        }

        return await askWikiAssistant({
            submission,
            userMessage,
            conversationHistory,
        });
    },

    /**
     * Ask the global AI assistant about dialects and culture.
     */
    askGlobalAssistant: async (userMessage, conversationHistory) => {
        return await askGlobalWikiAssistant({
            userMessage,
            conversationHistory,
        });
    },
};

