import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  // Check internship company_id linkage
  const { data: internships } = await supabase
    .from('internship')
    .select('internship_id, title, company_id, company(company_name)')
    .limit(5);
  
  console.log('Internships with company:', JSON.stringify(internships, null, 2));
}

check().catch(console.error);
