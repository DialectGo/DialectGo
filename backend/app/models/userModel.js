import { supabase, supabaseAdmin } from '../config/db.js';

// --- AUTHENTICATION ---
export const registerUser = async (email, password, metadata) => {
    const { data, error } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: { 
            data: {
                firstName: metadata.firstName,
                lastName: metadata.lastName,
                middleName: metadata.middleName,
                birthDate: metadata.birthDate, // Pass in 'YYYY-MM-DD' format
                addressLine: metadata.addressLine,
                country: metadata.country,
                province: metadata.province,
                city: metadata.city,
                username: metadata.username,
                preferredLanguageCode: metadata.preferredLanguageCode
            }
        }
    });
    if (error) throw error;
    return data.user;
};

export const loginUser = async (email, password) => {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

// --- PROFILE MANAGEMENT (Postgres) ---
export const getProfileById = async (userId) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("SUPABASE_QUERY_ERROR:", error); // This will print the full object
            throw error;
        }
        return data;
    } catch (err) {
        throw err;
    }
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
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(dbData)
        .eq('id', userId)
        .select();
    
    if (error) throw error;
    return data;
};