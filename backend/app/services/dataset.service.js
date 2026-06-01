import { supabaseAdmin } from '../config/db.js';
import { notifyAllAdmins } from './notification.service.js';

export const fetchAllDictionaryEntries = async () => {
    const { data, error } = await supabaseAdmin
        .from('dictionary_entries')
        .select(`
            *,
            languages (id, code, name),
            dictionary_translations!dictionary_translations_source_entry_id_fkey (
                id, target_entry_id, context_note
            )
        `)
        .order('id', { ascending: true });
        
    if (error) throw error;
    return data;
};

export const createPendingAction = async (makerId, payload) => {
    let originalData = null;

    if (payload.operationType !== 'INSERT' && payload.targetRowId) {
        // Explicitly format row ID parameter as string to prevent auto-casting glitches
        const targetSearchId = String(payload.targetRowId);

        const { data } = await supabaseAdmin
            .from(payload.targetTable)
            .select('*')
            .eq('id', targetSearchId)
            .single();
        originalData = data;
    }

    const { data: logEntry, error } = await supabaseAdmin
        .from('admin_activity_logs')
        .insert([{
            maker_id: makerId,
            target_table: payload.targetTable,
            operation_type: payload.operationType,
            target_row_id: String(payload.targetRowId), // Coerce down to text for safe unified log table storage
            original_data: originalData,
            proposed_data: payload.proposedData,
            status: 'pending',
            context_rationale: payload.rationale
        }])
        .select()
        .single();

    if (error) {
        console.error("Auditing log insertion failure trace:", error.message);
        throw error;
    }

    await notifyAllAdmins({
        type: 'PENDING_DATASET_VERIFICATION',
        title: 'New dataset change request pending approval',
        message: `A new ${payload.operationType.toLowerCase()} request on ${payload.targetTable} requires a second admin's verification.`,
        metadata: {
            maker_id: makerId,
            target_table: payload.targetTable,
            operation_type: payload.operationType,
            target_row_id: payload.targetRowId,
            rationale: payload.rationale
        }
    });

    return logEntry;
};

export const processVerification = async (logId, checkerId, decision) => {
    // 1. Fetch the target staged audit log
    const { data: log, error: logErr } = await supabaseAdmin
        .from('admin_activity_logs')
        .select('*')
        .eq('id', logId)
        .single();

    if (logErr || !log) throw new Error("Staged modification log not found.");
    
    // UAM Rule Enforcement: Prevent self-approval vulnerability loops
    if (log.maker_id === checkerId) {
        await supabaseAdmin.from('security_anomalies').insert([{
            rule_violated: 'DUAL_AUTH_BYPASS_ATTEMPT',
            severity: 'HIGH',
            description: `Administrator session attempted self-approval optimization bypassing maker-checker protocol on reference log entry #${logId}.`,
            is_resolved: false
        }]);
        throw new Error("Security Violation: You cannot verify your own data change request.");
    }

    if (decision === 'rejected') {
        const { data } = await supabaseAdmin
            .from('admin_activity_logs')
            .update({ status: 'rejected', checker_id: checkerId, updated_at: new Date() })
            .eq('id', logId)
            .select();
        return data;
    }

    // 2. Apply verified transaction to live tables dynamically
    let databaseExecutionError = null;

    if (log.operation_type === 'INSERT') {
        const { error } = await supabaseAdmin.from(log.target_table).insert([log.proposed_data]);
        databaseExecutionError = error;
    } else if (log.operation_type === 'UPDATE') {
        const { error } = await supabaseAdmin.from(log.target_table).update(log.proposed_data).eq('id', log.target_row_id);
        databaseExecutionError = error;
    } else if (log.operation_type === 'DELETE') {
        const { error } = await supabaseAdmin.from(log.target_table).delete().eq('id', log.target_row_id);
        databaseExecutionError = error;
    }

    if (databaseExecutionError) throw databaseExecutionError;

    // 3. Close out administrative PR record logs seamlessly
    const { data: updatedLog } = await supabaseAdmin
        .from('admin_activity_logs')
        .update({ status: 'approved', checker_id: checkerId, updated_at: new Date() })
        .eq('id', logId)
        .select();

    // 4. Register complete lifecycle confirmation to UAM timeline view
    await supabaseAdmin.from('security_anomalies').insert([{
        rule_violated: 'DATASET_MUTATION_VERIFIED',
        severity: 'LOW',
        description: `Verified operational dataset transaction type ${log.operation_type} executed against '${log.target_table}' by checker session references.`,
        is_resolved: true
    }]);

    return updatedLog;
};

export const fetchPendingActions = async (userId) => {
    const { data, error } = await supabaseAdmin
        .from('admin_activity_logs')
        .select('*, profiles!admin_activity_logs_maker_id_fkey(username, first_name)')
        .eq('status', 'pending')
        .not('maker_id', 'eq', userId); // Do not list self-generated requests

    if (error) throw error;
    return data;
};

export const exportLinguisticDataset = async (userId, targetLanguageId) => {
    // 1. Fetch data from existing dictionary architecture
    const { data: entries, error } = await supabaseAdmin
        .from('dictionary_entries')
        .select(`
            id, word_term, part_of_speech, definition, 
            dictionary_translations!source_entry_id (target_entry_id, context_note)
        `)
        .eq('language_id', targetLanguageId);

    if (error) throw error;

    // 2. Perform UAM structural threshold auditing rules
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: exportCount } = await supabaseAdmin
        .from('admin_activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('actor_id', userId)
        .eq('action_type', 'BULK_DATA_EXPORT')
        .gte('created_at', tenMinutesAgo);

    // Flag anomalies if threshold criteria are exceeded (> 3 exports in 10 minutes)
    if (exportCount && exportCount >= 3) {
        await supabaseAdmin.from('security_anomalies').insert({
            actor_id: userId,
            rule_violated: 'EXCESSIVE_EXPORTS',
            severity: 'HIGH',
            description: `User triggered bulk data export operations ${exportCount + 1} times within a 10-minute threshold windup window.`,
            context_data: { rateCount: exportCount + 1, timeWindowMinutes: 10 }
        });
    }

    return entries;
};