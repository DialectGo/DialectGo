import { supabaseAdmin } from '../config/db.js';

export const proposePromptUpdate = async (userId, updatePayload) => {
    const { promptId, newContent } = updatePayload;

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // Request valid for 24 hours

    const { data, error } = await supabaseAdmin
        .from('dual_authorizations')
        .insert({
            requested_by: userId,
            action_type: 'PROMPT_TEMPLATES_UPDATE',
            target_table: 'dictionary_entries', // Integrates with the existing table structure
            target_id: promptId,
            proposed_changes: { definition: newContent },
            expires_at: expiry.toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return { status: 'PENDING_APPROVAL', transaction: data };
};

export const evaluateDualAuthorization = async (reviewerId, authId, decision, rejectionReason = null) => {
    const { data: authReq } = await supabaseAdmin
        .from('dual_authorizations')
        .select('*')
        .eq('id', authId)
        .single();

    if (!authReq || authReq.status !== 'PENDING') {
        throw new Error('Authorization request is invalid, expired, or already processed');
    }

    if (authReq.requested_by === reviewerId) {
        throw new Error('Self-authorization is prohibited under compliance guidelines.');
    }

    if (decision === 'APPROVED') {
        // Apply the proposed changes to the core dictionary table
        const { error: patchError } = await supabaseAdmin
            .from('dictionary_entries')
            .update(authReq.proposed_changes)
            .eq('id', authReq.target_id);

        if (patchError) throw patchError;
    }

    const { data: updatedRecord } = await supabaseAdmin
        .from('dual_authorizations')
        .update({
            status: decision,
            approved_by: reviewerId,
            rejection_reason: rejectionReason
        })
        .eq('id', authId)
        .select();

    return updatedRecord;
};