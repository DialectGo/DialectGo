import { WikiModel } from '../models/wiki.model.js';

const PROMOTION_THRESHOLD = 10; // Net upvotes needed for auto-promotion

/**
 * Business logic layer for the DialectWiki feature.
 */
export const WikiService = {

    /**
     * List submissions with pagination and filters.
     */
    listSubmissions: async (query) => {
        const filters = {
            page: parseInt(query.page) || 1,
            limit: Math.min(parseInt(query.limit) || 20, 50), // Cap at 50
            region: query.region || null,
            category: query.category || null,
            status: query.status || null,
            search: query.search || null,
            sort: query.sort || 'newest',
        };

        return await WikiModel.getSubmissions(filters);
    },

    /**
     * Get a single submission with the current user's vote state.
     */
    getDetail: async (submissionId, userId) => {
        const { data: submission, error } = await WikiModel.getSubmissionById(submissionId);

        if (error || !submission) {
            return { data: null, error: error || new Error('Not found') };
        }

        // Fetch the user's current vote on this submission
        let userVote = null;
        if (userId) {
            const { data: voteData } = await WikiModel.getUserVote(submissionId, userId);
            userVote = voteData?.vote_type || null;
        }

        return {
            data: { ...submission, userVote },
            error: null,
        };
    },

    /**
     * Submit a new term. Checks for duplicates first.
     */
    submitTerm: async (userId, data) => {
        // Check for near-duplicate
        const { exists } = await WikiModel.checkDuplicate(data.source_term, data.region);
        if (exists) {
            return {
                data: null,
                error: { message: 'A similar term for this region already exists.' },
                status: 409,
            };
        }

        const { data: submission, error } = await WikiModel.createSubmission(userId, data);

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
    castVote: async (submissionId, userId, voteType) => {
        // 1. Check current vote
        const { data: existingVote } = await WikiModel.getUserVote(submissionId, userId);

        if (existingVote) {
            if (existingVote.vote_type === voteType) {
                // Same direction → remove vote (toggle off)
                await WikiModel.removeVote(submissionId, userId);
            } else {
                // Opposite direction → flip vote
                await WikiModel.upsertVote(submissionId, userId, voteType);
            }
        } else {
            // No existing vote → insert new
            await WikiModel.upsertVote(submissionId, userId, voteType);
        }

        // 2. Recalculate the net upvote count
        const { upvotes, error } = await WikiModel.recalculateUpvotes(submissionId);

        if (error) {
            return { upvotes: 0, promoted: false, error };
        }

        // 3. Check if this pushes the submission past the promotion threshold
        let promoted = false;
        if (upvotes >= PROMOTION_THRESHOLD) {
            // Fetch current status to avoid re-promoting
            const { data: submission } = await WikiModel.getSubmissionById(submissionId);
            if (submission && submission.status !== 'verified') {
                const { error: promoError } = await WikiModel.promoteToCorpus(submissionId);
                if (!promoError) {
                    promoted = true;
                    console.log(`[WikiService] 🎉 Submission ${submissionId} auto-promoted (${upvotes} upvotes)`);
                }
            }
        }

        return { upvotes, promoted, error: null };
    },
};
