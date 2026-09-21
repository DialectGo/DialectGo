import { supabase, supabaseAdmin, getAuthClient } from '../config/db.js';
import { createClient } from '@supabase/supabase-js';

const getAuthenticatedClient = (token) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } }
    }
  );
};
// AUTH
export const registerUser = async (data) => {
  const { email, password, ...meta } = data;

  const { data: result, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { ...meta, role: 'user' } }
  });

  if (error) throw error;

  // Supabase secure email enumeration protection returns a fake user with an empty identities array if the email already exists
  if (result?.user?.identities && result.user.identities.length === 0) {
    throw new Error("This email is already registered.");
  }

  // Explicitly sync additional metadata into the public.profiles table
  // because the Postgres trigger misses these non-standard camelCase keys.
  if (result.user) {
    try {
      await updateUser(result.user.id, {
        first_name: meta.firstName || null,
        last_name: meta.lastName || null,
        birth_date: meta.birthDate || null,
        country: meta.country || null,
        province: meta.province || null,
        city: meta.city || null,
        username: meta.username || null,
        preferred_language_code: meta.preferredLanguageCode || null,
        role: 'user' // Explicitly set role for manual sync fallback
      });
    } catch (syncError) {
      console.error("Warning: Could not sync additional profile data:", syncError);
    }
  }

  return result.user;
};

export const loginUser = async (email, password) => {
  // Log the email attempting to authenticate for debugging (do NOT log passwords)
  console.log('Attempting signInWithPassword for:', email);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

// PROFILE (RLS SAFE)
export const getProfileById = async (id, token) => {
  const client = getAuthClient(token);
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const updateProfileById = async (userId, updateData, token) => {
    const client = getAuthClient(token);
    // Complete mapping: Ensure these keys match your Database column names exactly
    const mapping = {
        firstName: 'first_name',
        lastName: 'last_name',
        middleName: 'middle_name',
        birthDate: 'birth_date',
        addressLine: 'address_line',
        country: 'country',
        province: 'province',
        city: 'city',
        username: 'username',
        preferredLanguageCode: 'preferred_language_code'
    };

    // Transform the incoming data
    const dbData = {};
    for (const [key, value] of Object.entries(updateData)) {
        // Use mapped name if it exists, otherwise assume the key is already the correct column name
        const dbKey = mapping[key] || key; 
        dbData[dbKey] = value;
    }

    // Sanitize: Convert empty strings to null for columns that don't accept them
    // (e.g., DATE columns like birth_date reject '' but accept null)
    const dateColumns = ['birth_date'];
    for (const col of dateColumns) {
        if (dbData[col] !== undefined && dbData[col] === '') {
            dbData[col] = null;
        }
    }

    // Perform the update
    const { data, error } = await client
        .from('profiles')
        .update(dbData)
        .eq('id', userId)
        .select();
    
    if (error) throw error;
    return data;
};

// ADMIN (uses service role)
export const getAllUsers = async () => {
  const { data, error } = await supabaseAdmin.from('profiles').select('*');
  if (error) throw error;
  return data;
};

export const getUserById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const updateUser = async (id, dataUpdate) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(dataUpdate)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

export const deleteUser = async (id) => {
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/** Minimum translations in a single day (Asia/Manila) for that day to count toward the streak. */
const MIN_TRANSLATIONS_FOR_ACTIVE_DAY = 2;

/**
 * Recalculates a user's daily-translation streak and syncs it to their profile.
 * A day counts as "active" once the user logs MIN_TRANSLATIONS_FOR_ACTIVE_DAY
 * translations on that calendar date (Asia/Manila). The streak is the number
 * of consecutive active days ending today or yesterday.
 *
 * @param {string} userId
 * @param {string} token - Auth token for RLS-scoped Supabase client
 * @returns {Promise<{ streak: number, activeDays: string[] }>}
 */
export const calculateAndSyncStreak = async (userId, token) => {
  const client = getAuthClient(token);

  // Helper to reliably get Manila date as a YYYY-MM-DD string
  const getManilaDateString = (dateObj) =>
    dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

  // Helper to advance a YYYY-MM-DD string by N days without going through
  // a UTC-midnight Date reconstruction (avoids timezone drift on the diff).
  const addDaysToDateString = (dateStr, days) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const utcMidnight = Date.UTC(year, month - 1, day + days);
    return new Date(utcMidnight).toISOString().slice(0, 10);
  };

  const { data, error } = await client
    .from('translation_history')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map translations to unique Manila-local dates and count them
  const dayCounts = {};
  for (const row of data) {
    const date = getManilaDateString(new Date(row.created_at));
    dayCounts[date] = (dayCounts[date] || 0) + 1;
  }

  // Identify "Active Days" (days meeting the minimum translation count)
  const activeDays = Object.keys(dayCounts)
    .filter((date) => dayCounts[date] >= MIN_TRANSLATIONS_FOR_ACTIVE_DAY)
    .sort((a, b) => (a < b ? 1 : -1)); // Newest first, pure string compare (YYYY-MM-DD sorts lexically)

  if (activeDays.length === 0) {
    await client.from('profiles').update({ streak_count: 0 }).eq('id', userId);
    return { streak: 0, activeDays: [] };
  }

  const today = getManilaDateString(new Date());
  const yesterday = addDaysToDateString(today, -1);

  let streak = 0;

  // Streak is only alive if the most recent active day is today or yesterday
  if (activeDays[0] === today || activeDays[0] === yesterday) {
    streak = 1;
    for (let i = 0; i < activeDays.length - 1; i++) {
      const current = activeDays[i];
      const expectedPrevious = addDaysToDateString(current, -1);

      if (activeDays[i + 1] === expectedPrevious) {
        streak++;
      } else {
        break; // Gap found — streak stops here
      }
    }
  }

  await client.from('profiles').update({ streak_count: streak }).eq('id', userId);

  return { streak, activeDays };
};

export const loginAsGuest = async () => {
  // Utilizing Supabase's native anonymous sign-in feature
  const { data, error } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        role: 'guest',
        is_anonymous: true
      }
    }
  });

  if (error) throw error;
  return data; // Returns session token, refresh token, and user properties
};