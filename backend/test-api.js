import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'alcantarajohnralph@gmail.com',
        password: 'password123' // Or I can't know the password...
    });
    
    if (error) {
        console.log('Login failed:', error.message);
        return;
    }
    
    console.log('Logged in. Sending request...');
    try {
        const response = await axios.post('http://localhost:5001/api/v1/translations/translate', {
            sourceText: "Bet kita!",
            sourceLang: "Tagalog",
            targetLang: "Cebuano",
            targetDialect: "Boholano",
            source_language_id: 2,
            target_language_id: 3
        }, {
            headers: {
                Authorization: `Bearer ${data.session.access_token}`
            }
        });
        console.log("Success:", response.data);
    } catch (e) {
        console.error("API Error:", e.response?.data || e.message);
    }
}
run();
