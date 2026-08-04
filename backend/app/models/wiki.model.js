import { supabase, supabaseAdmin, getAuthClient } from '../config/db.js';

/**
 * Data access layer for dialect_submissions and submission_votes.
 * Powers the DialectWiki community corpus feature.
 */
export const WikiModel = {

    /**
     * Fetch paginated submissions with optional filters.
     * Joins profiles for author attribution.
     */
    getSubmissions: async ({ page = 1, limit = 20, region, category, status, search, sort = 'newest', type }) => {
        const offset = (page - 1) * limit;

        let query = supabase
            .from('dialect_submissions')
            .select('*', { count: 'exact' });

        // Filters
        if (region) query = query.eq('region', region);
        if (category) query = query.eq('category', category);
        if (status) query = query.eq('status', status);
        if (type) query = query.eq('type', type);


        // Keyword search across source_term and translation
        if (search && search.trim()) {
            query = query.or(`source_term.ilike.%${search.trim()}%,translation.ilike.%${search.trim()}%`);
        }

        // Sorting
        if (sort === 'most_voted') {
            query = query.order('upvotes', { ascending: false });
        } else if (sort === 'verified') {
            query = query.eq('status', 'verified').order('created_at', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('[WikiModel.getSubmissions] Error:', error.message);
            return { data: [], error, count: 0 };
        }

        // Fetch profiles separately
        if (data && data.length > 0) {
            const userIds = [...new Set(data.map(item => item.user_id))];
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select('id, username, first_name, last_name')
                .in('id', userIds);
            
            const profileMap = {};
            if (profiles) {
                profiles.forEach(p => {
                    profileMap[p.id] = p;
                });
            }

            data.forEach(item => {
                item.profiles = profileMap[item.user_id] || null;
            });
        }

        return { data: data || [], error: null, count: count || 0 };
    },

    /**
     * Fetch a single submission by ID with author profile.
     */
    getSubmissionById: async (id) => {
        // Increment views before fetching
        const { error: rpcError } = await supabaseAdmin
            .rpc('increment_wiki_views', { row_id: id });
        if (rpcError) {
            // Silently fail if RPC doesn't exist yet
        }

        const { data, error } = await supabase
            .from('dialect_submissions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('[WikiModel.getSubmissionById] Error:', error.message);
            return { data, error };
        }

        if (data) {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('username, first_name, last_name')
                .eq('id', data.user_id)
                .single();
            data.profiles = profile || null;
        }

        return { data, error };
    },

    /**
     * Insert a new community submission.
     */
    createSubmission: async (token, userId, submissionData) => {
        const client = getAuthClient(token);
        const { data, error } = await client
            .from('dialect_submissions')
            .insert([{
                user_id: userId,
                source_term: submissionData.source_term,
                region: submissionData.region,
                category: submissionData.category,
                translation: submissionData.translation,
                usage_example: submissionData.usage_example || null,
                sentiment_tag: submissionData.sentiment_tag || null,
                type: submissionData.type || 'Term',
            }])
            .select();

        if (error) {
            console.error('[WikiModel.createSubmission] Error:', error.message);
        }

        return { data: data?.[0] || null, error };
    },

    /**
     * Check if a near-duplicate submission already exists.
     */
    checkDuplicate: async (sourceTerm, region) => {
        const { data, error } = await supabase
            .from('dialect_submissions')
            .select('id')
            .ilike('source_term', sourceTerm.trim())
            .eq('region', region)
            .neq('status', 'rejected')
            .limit(1);

        if (error) {
            console.error('[WikiModel.checkDuplicate] Error:', error.message);
            return { exists: false, error };
        }

        return { exists: (data && data.length > 0), error: null };
    },

    /**
     * Get the current user's vote on a specific submission.
     */
    getUserVote: async (submissionId, userId) => {
        const { data, error } = await supabase
            .from('submission_votes')
            .select('vote_type')
            .eq('submission_id', submissionId)
            .eq('user_id', userId)
            .maybeSingle();

        return { data, error };
    },

    /**
     * Upsert a vote (insert or update).
     */
    upsertVote: async (token, submissionId, userId, voteType) => {
        const client = getAuthClient(token);
        const { data, error } = await client
            .from('submission_votes')
            .upsert({
                submission_id: submissionId,
                user_id: userId,
                vote_type: voteType,
            }, { onConflict: 'submission_id,user_id' })
            .select();

        if (error) {
            console.error('[WikiModel.upsertVote] Error:', error.message);
        }

        return { data, error };
    },

    /**
     * Remove a user's vote entirely.
     */
    removeVote: async (token, submissionId, userId) => {
        const client = getAuthClient(token);
        const { error } = await client
            .from('submission_votes')
            .delete()
            .eq('submission_id', submissionId)
            .eq('user_id', userId);

        if (error) {
            console.error('[WikiModel.removeVote] Error:', error.message);
        }

        return { error };
    },

    /**
     * Recalculate the upvotes count from the votes table
     * and update the submission record.
     */
    recalculateUpvotes: async (submissionId) => {
        // Sum all votes for this submission
        const { data: votes, error: fetchError } = await supabaseAdmin
            .from('submission_votes')
            .select('vote_type')
            .eq('submission_id', submissionId);

        if (fetchError) {
            console.error('[WikiModel.recalculateUpvotes] Fetch error:', fetchError.message);
            return { upvotes: 0, error: fetchError };
        }

        const netVotes = (votes || []).reduce((sum, v) => sum + v.vote_type, 0);

        const { error: updateError } = await supabaseAdmin
            .from('dialect_submissions')
            .update({ upvotes: netVotes })
            .eq('id', submissionId);

        if (updateError) {
            console.error('[WikiModel.recalculateUpvotes] Update error:', updateError.message);
        }

        return { upvotes: netVotes, error: updateError };
    },

    /**
     * Promote a verified submission into the dialect_corpus table.
     * Copies the term data and marks the submission as 'verified'.
     */
    promoteToCorpus: async (submissionId) => {
        // Fetch the submission first using Admin to bypass any RLS
        const { data: submission, error: fetchError } = await supabaseAdmin
            .from('dialect_submissions')
            .select('*')
            .eq('id', submissionId)
            .single();

        if (fetchError || !submission) {
            console.error('[WikiModel.promoteToCorpus] Fetch error:', fetchError?.message);
            return { error: fetchError || new Error('Submission not found') };
        }

        // Guard: Don't promote Questions to the corpus
        if (submission.type === 'Question') {
            console.log(`[WikiModel] Skipping corpus promotion for Question "${submission.source_term}"`);
            // Still mark as verified
            const { error: updateError } = await supabaseAdmin
                .from('dialect_submissions')
                .update({ status: 'verified' })
                .eq('id', submissionId);
            return { error: updateError };
        }

        // Insert into dialect_corpus
        const { error: insertError } = await supabase
            .from('dialect_corpus')
            .insert([{
                source_text: submission.source_term.toLowerCase(),
                dialect_translation: submission.translation,
                region: submission.region,
                context_tag: submission.category,
                status: 'validated',
                standard_term: submission.translation,
                sentiment_score: 0.0,
                weight: 1.0,
            }]);

        if (insertError) {
            console.error('[WikiModel.promoteToCorpus] Insert error:', insertError.message);
            return { error: insertError };
        }

        // Mark submission as verified
        const { error: updateError } = await supabaseAdmin
            .from('dialect_submissions')
            .update({ status: 'verified' })
            .eq('id', submissionId);

        if (updateError) {
            console.error('[WikiModel.promoteToCorpus] Status update error:', updateError.message);
        }

        console.log(`[WikiModel] ✅ Promoted submission "${submission.source_term}" to dialect_corpus`);
        return { error: null };
    },

    // ─── Comments ────────────────────────────────────────────────────────────

    /**
     * Fetch all comments for a submission, with author profiles.
     */
    getComments: async (submissionId) => {
        const { data, error } = await supabase
            .from('wiki_comments')
            .select('*')
            .eq('submission_id', submissionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[WikiModel.getComments] Error:', error.message);
            return { data: [], error };
        }

        // Fetch author profiles
        if (data && data.length > 0) {
            const userIds = [...new Set(data.map(c => c.user_id))];
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select('id, username, first_name, last_name')
                .in('id', userIds);

            const profileMap = {};
            if (profiles) profiles.forEach(p => { profileMap[p.id] = p; });
            data.forEach(c => { c.profiles = profileMap[c.user_id] || null; });
        }

        return { data: data || [], error: null };
    },

    /**
     * Add a comment to a submission.
     */
    addComment: async (token, userId, submissionId, content) => {
        const client = getAuthClient(token);
        const { data, error } = await client
            .from('wiki_comments')
            .insert([{ user_id: userId, submission_id: submissionId, content }])
            .select();

        if (error) {
            console.error('[WikiModel.addComment] Error:', error.message);
        }

        return { data: data?.[0] || null, error };
    },

    // ─── Bookmarks ───────────────────────────────────────────────────────────

    /**
     * Check if the user has bookmarked a submission.
     */
    checkBookmark: async (userId, submissionId) => {
        const { data, error } = await supabase
            .from('wiki_bookmarks')
            .select('id')
            .eq('user_id', userId)
            .eq('submission_id', submissionId)
            .maybeSingle();

        return { bookmarked: !!data, error };
    },

    /**
     * Toggle bookmark: add if not exists, remove if exists.
     */
    toggleBookmark: async (token, userId, submissionId) => {
        // Check if already bookmarked
        const { data: existing } = await supabase
            .from('wiki_bookmarks')
            .select('id')
            .eq('user_id', userId)
            .eq('submission_id', submissionId)
            .maybeSingle();

        if (existing) {
            // Remove bookmark
            const client = getAuthClient(token);
            const { error } = await client
                .from('wiki_bookmarks')
                .delete()
                .eq('id', existing.id);
            return { bookmarked: false, error };
        } else {
            // Add bookmark
            const client = getAuthClient(token);
            const { error } = await client
                .from('wiki_bookmarks')
                .insert([{ user_id: userId, submission_id: submissionId }]);
            return { bookmarked: true, error };
        }
    },

    /**
     * Get all bookmarked submissions for a user.
     */
    getUserBookmarks: async (userId) => {
        const { data, error } = await supabase
            .from('wiki_bookmarks')
            .select('submission_id')
            .eq('user_id', userId);

        if (error) {
            console.error('[WikiModel.getUserBookmarks] Error:', error.message);
            return { data: [], error };
        }

        return { data: data || [], error: null };
    },
};
