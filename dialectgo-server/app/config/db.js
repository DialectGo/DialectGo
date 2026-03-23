// const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config();

// // Connect to your Supabase Database
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL, 
    // process.env.SUPABASE_ANON_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- CONNECTION CHECK ---
(async () => {
    try {
        const { error } = await supabase.from('cebuano').select('id').limit(1);
        
        if (error) throw error;

        console.log("Connection established with Supabase (PostgREST API)");
    } catch (err) {
        console.error("Failed to connect to Supabase:", err.message);
    }
})();

export default supabase;