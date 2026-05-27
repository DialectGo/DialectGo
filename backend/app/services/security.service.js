import { supabaseAdmin } from '../config/db.js';

export const recordFailedLogin = async ({
  email,
  ip,
  userAgent,
  attemptType
}) => {

  try {

    await supabaseAdmin
      .from('failed_login_attempts')
      .insert({
        email,
        ip_address: ip,
        user_agent: userAgent,
        attempt_type: attemptType
      });

    // Check brute force threshold
    const tenMinutesAgo = new Date(
      Date.now() - 10 * 60 * 1000
    );

    const { count, error } = await supabaseAdmin
      .from('failed_login_attempts')
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('ip_address', ip)
      .gte(
        'created_at',
        tenMinutesAgo.toISOString()
      );

    if (error) {
      console.error(
        'Failed login counter error:',
        error.message
      );
      return;
    }

    // Trigger brute force anomaly
    if (count >= 10) {

      await supabaseAdmin
        .from('security_anomalies')
        .insert({
          rule_violated: 'BRUTE_FORCE_ATTACK',

          severity: 'CRITICAL',

          description:
            `Detected ${count} failed admin login attempts from IP ${ip}`,

          context_data: {
            ip,
            email,
            attemptType,
            userAgent
          }
        });

      console.warn(
        `⚠️ Brute force attack detected from ${ip}`
      );
    }

  } catch (err) {

    console.error(
      'recordFailedLogin error:',
      err.message
    );

  }
};