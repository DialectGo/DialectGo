import { supabaseAdmin } from '../config/db.js';
import { checkImpossibleTravel } from '../utils/impossibleTravel.js';

// Dummy mapping replacement for external GeoIP provider integrations (e.g., fast-geoip or maxmind)
const mockGeoIPLookup = (ip) => {
    if (ip === '127.0.0.1' || ip === '::1') {
        return { country: 'PH', city: 'Manila', ll: [14.5995, 120.9842] };
    }
    // Simulate European routing anomaly for sample verification
    if (ip.startsWith('192.168.99')) {
        return { country: 'DE', city: 'Frankfurt', ll: [50.1109, 8.6821] };
    }
    return { country: 'PH', city: 'Tanauan', ll: [14.0843, 121.1492] };
};

export const logAdminActivity = (actionType, tableNameExtractor = () => null) => {
    return async (req, res, next) => {
        const originalJson = res.json;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const geo = mockGeoIPLookup(ip);

        // Intercept response lifecycle to log only on operational success
        res.json = function (data) {
            res.json = originalJson;
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const logData = {
                    actor_id: req.user?.id,
                    action_type: actionType,
                    table_name: tableNameExtractor(req),
                    resource_id: req.params?.id || req.body?.id || null,
                    payload: { 
                        method: req.method, 
                        url: req.originalUrl,
                        latitude: geo.ll[0],
                        longitude: geo.ll[1],
                        body: req.method !== 'GET' ? req.body : undefined 
                    },
                    ip_address: ip,
                    user_agent: req.headers['user-agent'],
                    country_code: geo.country,
                    city_name: geo.city
                };

                // Asynchronous execution execution ensures zero interface friction
                supabaseAdmin.from('admin_activity_logs').insert(logData)
                    .then(({ error }) => { if (error) console.error('UAM Log Error:', error); });

                // Run threat verification rules downstream
                if (actionType === 'ADMIN_LOGIN') {
                    evaluateLoginAnomaly(req.user.id, logData, geo);
                }
            }
            return res.json.call(this, data);
        };
        next();
    };
};

async function evaluateLoginAnomaly(userId, currentLog, geo) {
    const { data: historicalLogs } = await supabaseAdmin
        .from('admin_activity_logs')
        .select('created_at, payload, country_code, city_name')
        .eq('actor_id', userId)
        .eq('action_type', 'ADMIN_LOGIN')
        .order('created_at', { ascending: false })
        .limit(2);

    if (historicalLogs && historicalLogs.length > 1) {
        const lastLog = historicalLogs[1]; // Index 0 represents current event row
        const travelAnomaly = checkImpossibleTravel(lastLog, { latitude: geo.ll[0], longitude: geo.ll[1] });

        if (travelAnomaly) {
            await supabaseAdmin.from('security_anomalies').insert({
                actor_id: userId,
                rule_violated: 'IMPOSSIBLE_TRAVEL',
                severity: 'CRITICAL',
                description: `Admin account logged in from locations too far apart: ${lastLog.city_name} (${lastLog.country_code}) and ${geo.city} (${geo.country}) within a short time frame. Required travel speed: ${travelAnomaly.requiredSpeedKmh} km/h.`,
                context_data: { travelAnomaly, lastLocation: lastLog, currentLocation: currentLog }
            });
        }
    }
}