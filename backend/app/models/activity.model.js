import { getAuthClient } from '../config/db.js';

export const ActivityModel = {
    /**
     * Get user's Wiki Submissions (Posts)
     */
    getUserPosts: async (token, userId, limit = 50) => {
        const client = getAuthClient(token);
        const { data, error } = await client
            .from('dialect_submissions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (data && data.length > 0) {
            const userIds = [...new Set(data.map(item => item.user_id))];
            const submissionIds = data.map(item => item.id);

            const { data: profiles } = await client
                .from('profiles')
                .select('id, username, first_name, last_name, profile_avatar_url')
                .in('id', userIds);
            
            const profileMap = {};
            if (profiles) profiles.forEach(p => { profileMap[p.id] = p; });

            const { data: comments } = await client
                .from('wiki_comments')
                .select('submission_id')
                .in('submission_id', submissionIds);
            
            const commentCountMap = {};
            if (comments) {
                comments.forEach(c => {
                    commentCountMap[c.submission_id] = (commentCountMap[c.submission_id] || 0) + 1;
                });
            }

            data.forEach(item => { 
                item.profiles = profileMap[item.user_id] || null; 
                item.comments_count = commentCountMap[item.id] || 0;
            });
        }

        return { data: data || [], error };
    },


    /**
     * Get user's Bookmarked Wiki Posts
     */
    getUserBookmarks: async (token, userId, limit = 50) => {
        const client = getAuthClient(token);
        const { data, error } = await client
            .from('wiki_bookmarks')
            .select('created_at, submission_id, dialect_submissions(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (data && data.length > 0) {
            const userIds = [...new Set(data.map(item => item.dialect_submissions?.user_id).filter(Boolean))];
            const submissionIds = data.map(item => item.submission_id);

            const profileMap = {};
            if (userIds.length > 0) {
                const { data: profiles } = await client
                    .from('profiles')
                    .select('id, username, first_name, last_name, profile_avatar_url')
                    .in('id', userIds);
                if (profiles) profiles.forEach(p => { profileMap[p.id] = p; });
            }

            const commentCountMap = {};
            if (submissionIds.length > 0) {
                const { data: comments } = await client
                    .from('wiki_comments')
                    .select('submission_id')
                    .in('submission_id', submissionIds);
                if (comments) {
                    comments.forEach(c => {
                        commentCountMap[c.submission_id] = (commentCountMap[c.submission_id] || 0) + 1;
                    });
                }
            }

            data.forEach(item => { 
                if (item.dialect_submissions) {
                    item.dialect_submissions.profiles = profileMap[item.dialect_submissions.user_id] || null; 
                    item.dialect_submissions.comments_count = commentCountMap[item.submission_id] || 0;
                }
            });
        }

        return { data: data || [], error };
    },

    /**
     * Get user's Translation Suggestions
     */
    getUserTranslations: async (token, userId, limit = 50) => {
        const client = getAuthClient(token);
        const { data, error } = await client
            .from('user_recommended_translations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        return { data: data || [], error };
    }
};
