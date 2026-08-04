import { ActivityService } from '../services/activity.service.js';

/**
 * GET /api/activities
 * Fetch aggregated user activities (posts, comments, bookmarks, translations).
 */
export const getUserActivities = async (req, res, next) => {
    try {
        const { data, error } = await ActivityService.getUserActivities(req.token, req.user.id);
        
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};
