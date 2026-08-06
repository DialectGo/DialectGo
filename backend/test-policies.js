import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../../School_Works/Third_Year/DialectGo/backend/.env') });

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPolicies() {
    console.log("Fetching policies for dialect_corpus...");
    
    // Simulate anon
    const anonClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const anonRes = await anonClient.from('dialect_corpus').select('*').limit(1);
    console.log("Anon Read:", anonRes.error ? anonRes.error.message : "Success");

    // Simulate authenticated
    const email = 'test_policy_check@example.com';
    const password = 'password123';
    
    await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    const { data: { session }, error: signinError } = await anonClient.auth.signInWithPassword({
        email,
        password
    });

    if (signinError) {
        console.log("Sign-in failed:", signinError.message);
    } else {
        const authClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            }
        });
        const authRes = await authClient.from('dialect_corpus').select('*').limit(1);
        console.log("Authenticated Read (via header):", authRes.error ? authRes.error.message : "Success");

        // Try global authenticated (how it used to work)
        const globalClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        await globalClient.auth.signInWithPassword({ email, password });
        const globalRes = await globalClient.from('dialect_corpus').select('*').limit(1);
        console.log("Authenticated Read (via global client):", globalRes.error ? globalRes.error.message : "Success");
    }

    // Cleanup
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    if (user) {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
    }
}

checkPolicies();
