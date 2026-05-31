import { supabaseAdmin } from '../config/db.js';
import { checkImpossibleTravel } from '../utils/impossibleTravel.js';
import { geoLookup } from '../utils/geoLookup.js';

export const logAdminActivity = (
  operationType,
  tableNameExtractor = () => null
) => {

  return async (req, res, next) => {

    const originalJson = res.json;

    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    // Real geolocation lookup
    const geo = await geoLookup(ip);

    // Intercept successful responses only
    res.json = function (responseData) {

      res.json = originalJson;

      if (res.statusCode >= 200 && res.statusCode < 300) {

        const logPayload = {
          maker_id: req.user?.id || null,

          operation_type: operationType,

          target_table: tableNameExtractor(req),

          target_row_id:
            req.params?.id ||
            req.body?.id ||
            null,

          original_data: null,

          proposed_data: {
            method: req.method,
            route: req.originalUrl,
            body:
              req.method !== 'GET'
                ? req.body
                : undefined
          },

          status: 'approved',

          context_rationale: JSON.stringify({
            ip_address: geo.ip,
            country: geo.country,
            city: geo.city,
            latitude: geo.lat,
            longitude: geo.lon,
            isp: geo.isp,
            user_agent: req.headers['user-agent']
          })
        };

        // Async insert
        supabaseAdmin
          .from('admin_activity_logs')
          .insert(logPayload)
          .then(async ({ error }) => {

            if (error) {
              console.error(
                'Admin Activity Log Error:',
                error.message
              );
              return;
            }

            // Run impossible travel verification
            if (operationType === 'ADMIN_LOGIN') {
              await evaluateLoginAnomaly(
                req.user.id,
                geo
              );
            }
          });
      }

      return res.json.call(this, responseData);
    };

    next();
  };
};

async function evaluateLoginAnomaly(userId, currentGeo) {

  const { data: logs } = await supabaseAdmin
    .from('admin_activity_logs')
    .select('*')
    .eq('maker_id', userId)
    .eq('operation_type', 'ADMIN_LOGIN')
    .order('created_at', { ascending: false })
    .limit(2);

  if (!logs || logs.length < 2) {
    return;
  }

  const previousLog = logs[1];

  let previousContext = {};

  try {
    previousContext = JSON.parse(
      previousLog.context_rationale
    );
  } catch {
    return;
  }

  const anomaly = checkImpossibleTravel(
    {
      created_at: previousLog.created_at,
      payload: {
        latitude: previousContext.latitude,
        longitude: previousContext.longitude
      }
    },
    {
      latitude: currentGeo.lat,
      longitude: currentGeo.lon
    }
  );

  // Country comparison
  const countryChanged =
    previousContext.country !== currentGeo.country;

  // ISP comparison
  const ispChanged =
    previousContext.isp !== currentGeo.isp;

  // TOR/VPN heuristic
  const suspiciousNetwork =
    currentGeo.isp?.toLowerCase().includes('vpn') ||
    currentGeo.isp?.toLowerCase().includes('proxy') ||
    currentGeo.isp?.toLowerCase().includes('tor');

  if (
    anomaly ||
    countryChanged ||
    ispChanged ||
    suspiciousNetwork
  ) {

    await supabaseAdmin
      .from('security_anomalies')
      .insert({
        actor_id: userId,

        rule_violated: 'IMPOSSIBLE_TRAVEL',

        severity: 'CRITICAL',

        description:
          'Suspicious admin login detected from unfamiliar location or network.',

        context_data: {
          impossibleTravel: anomaly,
          countryChanged,
          ispChanged,
          suspiciousNetwork,
          previousLocation: previousContext,
          currentLocation: currentGeo
        }
      });
  }
}