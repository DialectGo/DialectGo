import { supabaseAdmin } from '../config/db.js';
import { notifyAllAdmins } from './notification.service.js';

export const createSecurityAlert = async ({
  actorId = null,
  severity,
  rule,
  description,
  context = {}
}) => {

  const { data } = await supabaseAdmin
    .from('security_anomalies')
    .insert({
      actor_id: actorId,
      severity,
      rule_violated: rule,
      description,
      context_data: context
    })
    .select()
    .single();

  await notifyAllAdmins({
    type: 'SECURITY_ALERT',
    title: `${severity} Security Alert`,
    message: description,
    metadata: context
  });

  return data;
};