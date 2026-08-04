import { supabaseAdmin } from '../config/db.js';

export const ActivityModel = {
    /**
     * Get user's Wiki Submissions (Posts)
     */
    getUserPosts: async (userId, limit = 50) => {
        const { data, error } = await supabaseAdmin
            .from('dialect_submissions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        return { data: data || [], error };
    },

    /**
     * Get user's Wiki Comments
     */
    getUserComments: async (userId, limit = 50) => {
        const { data, error } = await supabaseAdmin
            .from('wiki_comments')
            .select('id, submission_id, content, created_at, dialect_submissions(source_term)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        return { data: data || [], error };
    },

    /**
     * Get user's Bookmarked Wiki Posts
     */
    getUserBookmarks: async (userId, limit = 50) => {
        const { data, error } = await supabaseAdmin
            .from('wiki_bookmarks')
            .select('created_at, submission_id, dialect_submissions(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        return { data: data || [], error };
    },

    /**
     * Get user's Translation Suggestions
     */
    getUserTranslations: async (userId, limit = 50) => {
        const { data, error } = await supabaseAdmin
            .from('user_recommended_translations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        return { data: data || [], error };
    }
};
