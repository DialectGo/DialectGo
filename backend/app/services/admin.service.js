import { supabaseAdmin } from '../config/db.js';

/**
 * Admin Service — All administrative data access functions.
 * Uses supabaseAdmin since these are strictly admin-only operations.
 */
export const AdminService = {

    // ─── Dashboard Stats ─────────────────────────────────────────────────────
    getDashboardStats: async () => {
        const [profilesRes, submissionsRes, recsRes, corpusRes, dictRes] = await Promise.all([
            supabaseAdmin.from('profiles').select('id, role, is_disabled, last_active_at', { count: 'exact' }),
            supabaseAdmin.from('dialect_submissions').select('id, status', { count: 'exact' }),
            supabaseAdmin.from('user_recommended_translations').select('id, status', { count: 'exact' }),
            supabaseAdmin.from('dialect_corpus').select('id', { count: 'exact' }),
            supabaseAdmin.from('dictionary_entries').select('id', { count: 'exact' }),
        ]);

        const profiles = profilesRes.data || [];
        const submissions = submissionsRes.data || [];
        const recs = recsRes.data || [];

        const totalUsers = profiles.length;
        const activeUsers = profiles.filter(p => !p.is_disabled).length;
        const adminCount = profiles.filter(p => p.role === 'admin').length;

        const totalSubmissions = submissions.length;
        const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
        const verifiedSubmissions = submissions.filter(s => s.status === 'verified').length;

        const totalRecommendations = recs.length;
        const pendingRecommendations = recs.filter(r => r.status === 'pending').length;
        const approvedRecommendations = recs.filter(r => r.status === 'approved').length;

        const totalCorpus = corpusRes.count || 0;
        const totalDictionary = dictRes.count || 0;

        return {
            users: { total: totalUsers, active: activeUsers, admins: adminCount },
            wiki: { total: totalSubmissions, pending: pendingSubmissions, verified: verifiedSubmissions },
            translations: { total: totalRecommendations, pending: pendingRecommendations, approved: approvedRecommendations },
            corpus: { total: totalCorpus },
            dictionary: { total: totalDictionary },
        };
    },

    // ─── Users ───────────────────────────────────────────────────────────────
    getAllUsers: async () => {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        return { data: data || [], error };
    },

    updateUserRole: async (userId, role) => {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ role })
            .eq('id', userId)
            .select()
            .single();
        return { data, error };
    },

    toggleUserDisabled: async (userId, isDisabled) => {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ is_disabled: isDisabled })
            .eq('id', userId)
            .select()
            .single();
        return { data, error };
    },

    // ─── Dictionary ──────────────────────────────────────────────────────────
    getDictionaryEntries: async (page = 1, limit = 20) => {
        const offset = (page - 1) * limit;
        const { data, error, count } = await supabaseAdmin
            .from('dictionary_entries')
            .select('*', { count: 'exact' })
            .order('word_term', { ascending: true })
            .range(offset, offset + limit - 1);
        return { data: data || [], error, count: count || 0 };
    },

    addDictionaryEntry: async (entry) => {
        const { data, error } = await supabaseAdmin
            .from('dictionary_entries')
            .insert([entry])
            .select()
            .single();
        return { data, error };
    },

    updateDictionaryEntry: async (id, update) => {
        const { data, error } = await supabaseAdmin
            .from('dictionary_entries')
            .update(update)
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    deleteDictionaryEntry: async (id) => {
        const { error } = await supabaseAdmin
            .from('dictionary_entries')
            .delete()
            .eq('id', id);
        return { error };
    },

    // ─── Translations (User Recommendations) ────────────────────────────────
    getTranslationRecommendations: async (status = null) => {
        let query = supabaseAdmin
            .from('user_recommended_translations')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        return { data: data || [], error };
    },

    approveTranslation: async (id) => {
        const { data, error } = await supabaseAdmin
            .from('user_recommended_translations')
            .update({ status: 'approved' })
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    rejectTranslation: async (id) => {
        const { data, error } = await supabaseAdmin
            .from('user_recommended_translations')
            .update({ status: 'rejected' })
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    // ─── Wiki Submissions ────────────────────────────────────────────────────
    getWikiSubmissions: async (status = null) => {
        let query = supabaseAdmin
            .from('dialect_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (data && data.length > 0) {
            const userIds = [...new Set(data.map(s => s.user_id))];
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select('id, username, first_name, last_name')
                .in('id', userIds);

            const profileMap = {};
            if (profiles) {
                profiles.forEach(p => { profileMap[p.id] = p; });
            }
            data.forEach(s => { s.profiles = profileMap[s.user_id] || null; });
        }

        return { data: data || [], error };
    },

    verifySubmission: async (submissionId) => {
        const { data, error } = await supabaseAdmin
            .from('dialect_submissions')
            .update({ status: 'verified' })
            .eq('id', submissionId)
            .select()
            .single();
        return { data, error };
    },

    rejectSubmission: async (submissionId) => {
        const { data, error } = await supabaseAdmin
            .from('dialect_submissions')
            .update({ status: 'rejected' })
            .eq('id', submissionId)
            .select()
            .single();
        return { data, error };
    },

    // ─── Dialect Corpus ──────────────────────────────────────────────────────
    getCorpusEntries: async (page = 1, limit = 20) => {
        const offset = (page - 1) * limit;
        const { data, error, count } = await supabaseAdmin
            .from('dialect_corpus')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        return { data: data || [], error, count: count || 0 };
    },

    deleteCorpusEntry: async (id) => {
        const { error } = await supabaseAdmin
            .from('dialect_corpus')
            .delete()
            .eq('id', id);
        return { error };
    },
};
