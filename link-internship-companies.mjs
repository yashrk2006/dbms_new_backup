import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SQL = `
-- Step 1: Get all company IDs into a temp array
DO $$
DECLARE
  company_ids UUID[];
  total_companies INT;
  total_internships INT;
  i INT := 1;
  rec RECORD;
BEGIN
  SELECT ARRAY(SELECT company_id FROM company ORDER BY RANDOM()) INTO company_ids;
  total_companies := array_length(company_ids, 1);

  IF total_companies = 0 THEN
    RAISE NOTICE 'No companies found. Skipping.';
    RETURN;
  END IF;

  SELECT COUNT(*) INTO total_internships FROM internship WHERE company_id IS NULL;
  RAISE NOTICE 'Linking % orphan internships to % companies', total_internships, total_companies;

  FOR rec IN SELECT internship_id FROM internship WHERE company_id IS NULL ORDER BY internship_id
  LOOP
    UPDATE internship 
    SET company_id = company_ids[((i - 1) % total_companies) + 1]
    WHERE internship_id = rec.internship_id;
    i := i + 1;
  END LOOP;

  RAISE NOTICE 'Done! All internships now linked to companies.';
END $$;

-- Verify the fix
SELECT i.internship_id, i.title, i.company_id, c.company_name
FROM internship i
LEFT JOIN company c ON i.company_id = c.company_id
LIMIT 10;
`;

async function run() {
  await client.connect();
  try {
    const res = await client.query(SQL);
    // Show the SELECT result (last statement)
    const rows = res[res.length - 1]?.rows || res?.rows || [];
    console.log('✅ Internships now linked:');
    rows.forEach(r => {
      console.log(`  [${r.internship_id}] ${r.title} → ${r.company_name || 'NULL'}`);
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
  await client.end();
}

run();
