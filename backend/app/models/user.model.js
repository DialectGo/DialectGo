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