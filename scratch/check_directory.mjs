import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase.from('college_directory').select('*');
    if (error) {
        console.error('Error fetching directory:', error);
    } else {
        console.log('Total records:', data.length);
        console.log('Records:', data);
    }
}
main();
