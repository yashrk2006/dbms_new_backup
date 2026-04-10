import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    // Run a postgres function or raw SQL if possible, but JS client does not support raw SQL out of the box unless RPC is allowed.
    // So let's just query a known list of tables we might see.
    const knownTables = [
        'college_directory',
        'students',
        'company_users',
        'companies',
        'internships',
        'applications',
        'profiles',
        'student_records', 
        'student_data',
        'batch_directory',
        'users'
    ];

    for (const table of knownTables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            // maybe table doesn't exist
            // console.log(`Table ${table} error:`, error.message);
        } else {
            console.log(`Table ${table}: ${count} records`);
        }
    }
}
main();
