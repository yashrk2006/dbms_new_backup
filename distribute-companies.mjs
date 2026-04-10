import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// We'll create standalone company records that don't need auth.users FK
// by using UUIDs that already exist in auth.users for the one real company
// and for display-only company data, we insert them with a synthetic UUID
const COMPANIES = [
  { name: 'Google', industry: 'Technology', location: 'Bangalore' },
  { name: 'Microsoft', industry: 'Technology', location: 'Hyderabad' },
  { name: 'Amazon', industry: 'E-Commerce', location: 'Pune' },
  { name: 'Flipkart', industry: 'E-Commerce', location: 'Bangalore' },
  { name: 'Zomato', industry: 'Food-Tech', location: 'Gurugram' },
  { name: 'Swiggy', industry: 'Food-Tech', location: 'Bangalore' },
  { name: 'Razorpay', industry: 'FinTech', location: 'Bangalore' },
  { name: 'PhonePe', industry: 'FinTech', location: 'Bangalore' },
  { name: 'Ola', industry: 'Transport-Tech', location: 'Bangalore' },
  { name: 'Meesho', industry: 'Social Commerce', location: 'Bangalore' },
  { name: 'Paytm', industry: 'FinTech', location: 'Noida' },
  { name: 'CRED', industry: 'FinTech', location: 'Bangalore' },
  { name: 'Groww', industry: 'WealthTech', location: 'Bangalore' },
  { name: 'Zerodha', industry: 'WealthTech', location: 'Bangalore' },
  { name: 'Freshworks', industry: 'SaaS', location: 'Chennai' },
  { name: 'Zoho', industry: 'SaaS', location: 'Chennai' },
  { name: 'Infosys', industry: 'IT Services', location: 'Pune' },
  { name: 'TCS', industry: 'IT Services', location: 'Mumbai' },
  { name: 'Wipro', industry: 'IT Services', location: 'Bangalore' },
];

async function run() {
  await client.connect();
  
  // Step 1: Insert companies with synthetic UUIDs (no auth.users dependency needed for display)
  // We'll disable the FK constraint temporarily or use existing user UUIDs
  // Better approach: get existing auth user IDs and map multiple companies to them via a workaround
  
  // Check which auth user IDs exist
  const { rows: existingUsers } = await client.query(`
    SELECT id FROM auth.users LIMIT 5;
  `);
  
  console.log('Existing auth users:', existingUsers.length);
  
  // Check existing companies
  const { rows: existingCompanies } = await client.query(`
    SELECT company_id, company_name FROM company ORDER BY company_name;
  `);
  console.log('Existing companies:', existingCompanies.length);
  existingCompanies.forEach(c => console.log(' -', c.company_name, c.company_id.substring(0, 8)));
  
  // Now distribute internships evenly among ALL existing companies
  const companyIds = existingCompanies.map(c => c.company_id);
  const total = companyIds.length;
  
  if (total === 0) {
    console.log('No companies! Exiting.');
    await client.end();
    return;
  }
  
  // Get all internships
  const { rows: internships } = await client.query(`SELECT internship_id, title FROM internship ORDER BY internship_id;`);
  console.log(`\nDistributing ${internships.length} internships across ${total} companies...`);
  
  for (let i = 0; i < internships.length; i++) {
    const companyId = companyIds[i % total];
    await client.query(`UPDATE internship SET company_id = $1 WHERE internship_id = $2`, [companyId, internships[i].internship_id]);
    console.log(`  [${internships[i].internship_id}] ${internships[i].title} → ${existingCompanies[i % total].company_name}`);
  }
  
  console.log('\n✅ Done! All internships now linked to diverse companies.');
  await client.end();
}

run().catch(console.error);
