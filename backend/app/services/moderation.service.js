import { supabaseAdmin } from '../config/db.js';

export const processTranslationApproval = async (moderatorId, recommendationId, statusDecision) => {
    // 1. Update the status on the existing user_recommended_translations table
    const { data: updatedRec, error } = await supabaseAdmin
        .from('user_recommended_translations')
        .update({ status: statusDecision })
        .eq('id', recommendationId)
        .select()
        .single();

    if (error) throw error;

    // 2. Fetch the moderator's activity metrics over the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: approvalCount } = await supabaseAdmin
        .from('admin_activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('actor_id', moderatorId)
        .eq('action_type', 'TRANSLATION_APPROVAL')
        .gte('created_at', oneHourAgo);

    // Flag anomalies if historical velocity limits are crossed (> 100 approvals per hour)
    const upperLimitVelocity = 100;
    if (approvalCount && approvalCount > upperLimitVelocity) {
        // Verify if an anomaly alert has already been generated for this window
        const { data: existingAlert } = await supabaseAdmin
            .from('security_anomalies')
            .select('id')
            .eq('actor_id', moderatorId)
            .eq('rule_violated', 'MODERATION_SPIKE')
            .eq('is_resolved', false)
            .maybeSingle();

        if (!existingAlert) {
            await supabaseAdmin.from('security_anomalies').insert({
                actor_id: moderatorId,
                rule_violated: 'MODERATION_SPIKE',
                severity: 'MEDIUM',
                description: `Moderator is approving translations at an unusual rate: ${approvalCount} updates/hr. (Threshold limit: ${upperLimitVelocity}/hr). Inspect for automated scripts or script manipulation.`,
                context_data: { rawVelocityCount: approvalCount, window: '1h' }
            });
        }
    }

    return updatedRec;
};