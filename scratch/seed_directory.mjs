import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const records = [
        {
            roll_no: '24/70002',
            enrollment_no: 'EN24102',
            name: 'John Doe',
            role: 'student',
            course: 'B.Tech',
            branch: 'Information Technology',
            batch_year: 2025
        },
        {
            roll_no: '24/70003',
            enrollment_no: 'EN24103',
            name: 'Jane Smith',
            role: 'student',
            course: 'B.Tech',
            branch: 'Electronics',
            batch_year: 2025
        },
        {
            roll_no: '24/70004',
            enrollment_no: 'EN24104',
            name: 'Alice Johnson',
            role: 'student',
            course: 'M.Tech',
            branch: 'Computer Science',
            batch_year: 2024
        },
        // We will also insert records for other students based on DB
    ];

    const { error } = await supabase.from('college_directory').upsert(records, { onConflict: 'roll_no' });
    if (error) {
        console.error('Error inserting directory records:', error);
    } else {
        console.log('Successfully inserted more dummy records into college_directory.');
    }
}
main();
