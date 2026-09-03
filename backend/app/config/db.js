// const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config();

// // Connect to your Supabase Database
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_ANON_KEY,
);
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Instantiate a scoped Supabase client authenticated as the user making the request.
 * This ensures that Row Level Security (RLS) is applied to all queries made with this client.
 */
export const getAuthClient = (token) => {
    if (!token || token === 'null' || token === 'undefined') {
        return supabase;
    }
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};

const connectDB = async () => {
    try {
        // check connection
        const { error } = await supabase.auth.getSession();
        if (error) throw error;

        // Extract the host name 
        const url = new URL(process.env.SUPABASE_URL);
        const host = url.host;

        console.log(`Supabase Connected: ${host}`);

    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};
console.log("Anon Key Loaded:", process.env.SUPABASE_ANON_KEY ? "Yes" : "No");
console.log("Service Role Key Loaded:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Yes" : "No");
export { supabase, supabaseAdmin, connectDB };