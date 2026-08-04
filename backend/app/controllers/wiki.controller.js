import { WikiService } from '../services/wiki.service.js';

/**
 * GET /api/wiki
 * Fetch paginated community submissions with optional filters.
 */
export const listSubmissions = async (req, res, next) => {
    try {
        const { data, error, count } = await WikiService.listSubmissions(req.query);

        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }

        res.status(200).json({
            success: true,
            data,
            pagination: {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                total: count,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/wiki/:id
 * Fetch a single submission with the current user's vote state.
 */
export const getSubmission = async (req, res, next) => {
    try {
        const { data, error } = await WikiService.getDetail(req.params.id, req.user?.id);

        if (error) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/wiki
 * Create a new community submission.
 */
export const createSubmission = async (req, res, next) => {
    try {
        const { data, error, status } = await WikiService.submitTerm(req.user.id, req.body);

        if (error) {
            return res.status(status || 500).json({ success: false, message: error.message });
        }

        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/wiki/:id/vote
 * Cast or toggle a vote on a submission.
 */
export const voteOnSubmission = async (req, res, next) => {
    try {
        const { upvotes, promoted, error } = await WikiService.castVote(
            req.params.id,
            req.user.id,
            req.body.vote_type
        );

        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }

        res.status(200).json({
            success: true,
            upvotes,
            promoted,
            message: promoted ? '🎉 This term has been verified and added to the corpus!' : undefined,
        });
    } catch (err) {
        next(err);
    }
};
