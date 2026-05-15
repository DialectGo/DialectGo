import { supabase, supabaseAdmin } from '../config/db.js';
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
    options: { data: meta }
  });

  if (error) throw error;
  return result.user;
};

export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

// PROFILE (RLS SAFE)
export const getProfileById = async (id) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const updateProfileById = async (userId, updateData) => {
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

    // Perform the update
    const { data, error } = await supabase
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

// Add to user.model.js
// user.model.js

export const calculateAndSyncStreak = async (userId) => {
  // 1. Fetch all translation timestamps for this user
  const { data, error } = await supabase
    .from('translation_history')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // 2. Map translations to unique dates and count them
  const dayCounts = {};
  data.forEach(row => {
    // Convert timestamp to local date string (YYYY-MM-DD)
    const date = new Date(row.created_at).toISOString().split('T')[0];
    dayCounts[date] = (dayCounts[date] || 0) + 1;
  });

  // 3. Identify "Active Days" (days with 3 or more translations)
  const activeDays = Object.keys(dayCounts)
    .filter(date => dayCounts[date] >= 3)
    .sort((a, b) => new Date(b) - new Date(a)); // Newest first

  if (activeDays.length === 0) {
    await supabase.from('profiles').update({ streak_count: 0 }).eq('id', userId);
    return { streak: 0, activeDays: [] };
  }

  // 4. Calculate consecutive days
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Check if the user is active today or was at least active yesterday
  // If not, the streak has already broken.
  if (activeDays[0] === today || activeDays[0] === yesterdayStr) {
    streak = 1;
    for (let i = 0; i < activeDays.length - 1; i++) {
      const current = new Date(activeDays[i]);
      const next = new Date(activeDays[i + 1]);
      
      // Calculate difference in days
      const diffTime = Math.abs(current - next);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
  }

  // 5. Sync to profile
  await supabase
    .from('profiles')
    .update({ streak_count: streak })
    .eq('id', userId);

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