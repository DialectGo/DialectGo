import * as UserModel from '../models/user.model.js';
import { geoLookup } from '../utils/geoLookup.js';
import { generateDeviceFingerprint } from '../utils/deviceFingerprint.js';
import { notifyAllAdmins } from './notification.service.js';
import { recordFailedLogin } from './security.service.js';
import { checkImpossibleTravel } from '../utils/impossibleTravel.js';
import { supabaseAdmin } from '../config/db.js';

export const register = async (data) => {
  return await UserModel.registerUser(data);
};

export const login = async (email, password) => {
  return await UserModel.loginUser(email, password);
};

export const getProfile = async (userId) => {
  return await UserModel.getProfileById(userId);
};

export const updateProfile = async (userId, data) => {
  return await UserModel.updateProfileById(userId, data);
};

export const getAllUsers = async () => {
  return await UserModel.getAllUsers();
};

export const getUserById = async (id) => {
  return await UserModel.getUserById(id);
};

export const updateUser = async (id, data) => {
  return await UserModel.updateUser(id, data);
};

export const deleteUser = async (id) => {
  return await UserModel.deleteUser(id);
};

export const getStreakInfo = async (userId) => {
  // Always recalculate to ensure accuracy based on historical data
  return await UserModel.calculateAndSyncStreak(userId);
};

export const refreshStreak = async (userId) => {
  return await UserModel.calculateAndSyncStreak(userId);
};

export const updateStreakStatus = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Count translations for the user today
  const { count, error } = await supabase
    .from('translation_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`);

  if (error) throw error;

  // 2. If threshold (3) is met, update the profile streak
  if (count === 3) {
    // We only increment once per day when they hit exactly 3
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count')
      .eq('id', userId)
      .single();

    await supabase
      .from('profiles')
      .update({ streak_count: (profile.streak_count || 0) + 1 })
      .eq('id', userId);
  }
};

export const loginAsGuest = async () => {
  return await UserModel.loginAsGuest();
};


export const adminLogin = async (email, password, req) => {

  try {

    const sessionData = await UserModel.loginUser(email, password);

    const userId = sessionData.user.id;

    const profile = await UserModel.getProfileById(userId);

    if (!profile || profile.role !== 'admin') {

      await recordFailedLogin({
        email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        attemptType: 'NON_ADMIN_ACCESS'
      });

      throw new Error('Access Denied');
    }

    const geo = await geoLookup(req.ip);

    /**
     * FOREIGN COUNTRY LOGIN DETECTION
     */
    const trustedCountry = 'PH';

    if (
      geo.country &&
      geo.country !== trustedCountry
    ) {

      /**
       * CREATE SECURITY ANOMALY
       */
      await supabaseAdmin
        .from('security_anomalies')
        .insert({

          actor_id: userId,

          rule_violated: 'FOREIGN_COUNTRY_LOGIN',

          severity: 'HIGH',

          description:
            `${profile.username} logged in from ` +
            `${geo.city}, ${geo.country}. ` +
            `Expected country: ${trustedCountry}.`,

          context_data: {

            ip_address: geo.ip,

            detected_country: geo.country,

            detected_city: geo.city,

            isp: geo.isp,

            expected_country: trustedCountry,

            login_time:
              new Date().toISOString(),

            user_agent:
              req.headers['user-agent']
          }
        });

      /**
       * SEND ADMIN ALERT
       */
      await notifyAllAdmins({

        type: 'FOREIGN_COUNTRY_LOGIN',

        title: 'Foreign Country Login Detected',

        message:
          `${profile.username} logged in from ` +
          `${geo.city}, ${geo.country}.`,

        metadata: {

          ip: geo.ip,

          country: geo.country,

          city: geo.city,

          isp: geo.isp
        }
      });
    }

    const deviceFingerprint = generateDeviceFingerprint(req);

    /**
     * FETCH LAST LOGIN SESSION
     */
    const { data: lastSession } = await supabaseAdmin
      .from('active_admin_sessions')
      .select('*')
      .eq('admin_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    /**
     * IMPOSSIBLE TRAVEL DETECTION
     */
    if (lastSession) {

      const travelCheck = checkImpossibleTravel(
        {
          created_at: lastSession.created_at,
          payload: {
            latitude: lastSession.latitude,
            longitude: lastSession.longitude,
            country: lastSession.country_code,
            isp: lastSession.isp_name
          }
        },
        {
          latitude: geo.lat,
          longitude: geo.lon,
          country: geo.country,
          isp: geo.isp
        }
      );

      if (travelCheck) {

        /**
         * INSERT SECURITY ANOMALY
         */
        await supabaseAdmin
          .from('security_anomalies')
          .insert({

            actor_id: userId,

            rule_violated: 'IMPOSSIBLE_TRAVEL',

            severity: 'CRITICAL',

            description:
              `Impossible travel detected. ` +
              `${travelCheck.distanceKm}km traveled in ` +
              `${travelCheck.timeDiffHrs} hours. ` +
              `Required speed: ${travelCheck.requiredSpeedKmh} km/h.`,

            context_data: {

              previous_location: {
                city: lastSession.city_name,
                country: lastSession.country_code,
                latitude: lastSession.latitude,
                longitude: lastSession.longitude
              },

              current_location: {
                city: geo.city,
                country: geo.country,
                latitude: geo.lat,
                longitude: geo.lon
              },

              metrics: travelCheck
            }
          });

        /**
         * SEND REAL-TIME ADMIN ALERT
         */
        await notifyAllAdmins({

          type: 'IMPOSSIBLE_TRAVEL',

          title: 'Impossible Travel Detected',

          message:
            `${profile.username} logged in from ` +
            `${geo.city}, ${geo.country} shortly after ` +
            `another distant login.`,

          metadata: {
            distanceKm: travelCheck.distanceKm,
            requiredSpeed: travelCheck.requiredSpeedKmh
          }
        });
      }
    }

    /**
     * STORE CURRENT SESSION
     */
    await supabaseAdmin
      .from('active_admin_sessions')
      .insert({
        admin_id: userId,
        ip_address: geo.ip,
        user_agent: req.headers['user-agent'],
        device_fingerprint: deviceFingerprint,
        country_code: geo.country,
        city_name: geo.city,
        latitude: geo.lat,
        longitude: geo.lon,
        isp_name: geo.isp
      });

    // Detect unfamiliar location
    const { data: knownDevices } = await supabaseAdmin
      .from('known_admin_devices')
      .select('*')
      .eq('admin_id', userId)
      .eq('device_fingerprint', deviceFingerprint);

    if (!knownDevices?.length) {

      await notifyAllAdmins({
        type: 'NEW_DEVICE_LOGIN',
        title: 'New Device Login Detected',
        message: `${profile.username} logged in from a new device/location`,
        metadata: {
          ip: req.ip,
          city: geo.city,
          country: geo.country
        }
      });

      await supabaseAdmin
        .from('known_admin_devices')
        .insert({
          admin_id: userId,
          device_fingerprint: deviceFingerprint,
          user_agent: req.headers['user-agent'],
          first_ip: req.ip,
          last_ip: req.ip,
          country_code: geo.country,
          city_name: geo.city
        });
    }

    console.log('Admin login success for userId:', userId);

    return {
      user: {
        id: profile.id,
        email: sessionData.user.email,
        role: profile.role
      },
      session: sessionData.session
    };

  } catch (err) {

    await recordFailedLogin({
      email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      attemptType: 'INVALID_CREDENTIALS'
    });

    throw err;
  }
};