import { ActivityModel } from '../models/activity.model.js';

export const ActivityService = {
    getUserActivities: async (token, userId) => {
        // Fetch all activities concurrently for better performance
        const [postsResult, commentsResult, bookmarksResult, translationsResult] = await Promise.all([
            ActivityModel.getUserPosts(token, userId, 20),
            ActivityModel.getUserComments(token, userId, 20),
            ActivityModel.getUserBookmarks(token, userId, 20),
            ActivityModel.getUserTranslations(token, userId, 20)
        ]);

        // If any of these failed critically, we could throw an error, 
        // but it's often better to just return empty arrays for the failed parts and log the error.
        if (postsResult.error) console.error('[ActivityService] posts error:', postsResult.error.message);
        if (commentsResult.error) console.error('[ActivityService] comments error:', commentsResult.error.message);
        if (bookmarksResult.error) console.error('[ActivityService] bookmarks error:', bookmarksResult.error.message);
        if (translationsResult.error) console.error('[ActivityService] translations error:', translationsResult.error.message);

        return {
            data: {
                posts: postsResult.data,
                comments: commentsResult.data,
                bookmarks: bookmarksResult.data.map(b => b.dialect_submissions), // flatten nested submission
                translations: translationsResult.data
            },
            error: null
        };
    }
};
