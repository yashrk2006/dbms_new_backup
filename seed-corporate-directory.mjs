import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DATABASE_URL) {
  console.error('❌ Missing environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL)');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const CORPORATE_GRID = [
  { name: 'Google', email: 'hiring@google.com', industry: 'Technology', location: 'Mountain View, CA' },
  { name: 'Microsoft', email: 'careers@microsoft.com', industry: 'Software', location: 'Redmond, WA' },
  { name: 'Meta Core', email: 'talent@meta.com', industry: 'Social Media', location: 'Menlo Park, CA' },
  { name: 'NVIDIA AI', email: 'deeplearning@nvidia.com', industry: 'Hardware/AI', location: 'Santa Clara, CA' },
  { name: 'Amazon Web', email: 'cloud-hiring@amazon.com', industry: 'Cloud Computing', location: 'Seattle, WA' },
  { name: 'Tesla Motors', email: 'autofill@tesla.com', industry: 'Automotive', location: 'Austin, TX' },
  { name: 'Goldman Sachs', email: 'finance@goldman.com', industry: 'Finance', location: 'New York, NY' },
  { name: 'IBM Neural', email: 'watson@ibm.com', industry: 'Enterprise AI', location: 'Armonk, NY' },
  { name: 'Tata (TCS)', email: 'talent@tcs.com', industry: 'IT Services', location: 'Mumbai, IN' },
  { name: 'McKinsey & Co', email: 'strategy@mckinsey.com', industry: 'Consulting', location: 'Global' },
  { name: 'BCG Digital', email: 'nexus@bcg.com', industry: 'Consulting', location: 'Boston, MA' },
  { name: 'Adobe Design', email: 'creative@adobe.com', industry: 'Design', location: 'San Jose, CA' },
  { name: 'SpaceX', email: 'starlink@spacex.com', industry: 'Aerospace', location: 'Hawthorne, CA' },
  { name: 'Netflix', email: 'content@netflix.com', industry: 'Streaming', location: 'Los Gatos, CA' },
  { name: 'Apple Core', email: 'os@apple.com', industry: 'Consumer Tech', location: 'Cupertino, CA' },
  { name: 'Oracle', email: 'db-sales@oracle.com', industry: 'Database', location: 'Austin, TX' },
  { name: 'Intel', email: 'foundry@intel.com', industry: 'Semiconductors', location: 'Santa Clara, CA' },
  { name: 'Salesforce', email: 'cloud-crm@salesforce.com', industry: 'SaaS', location: 'San Francisco, CA' },
  { name: 'Wipro', email: 'hiring@wipro.com', industry: 'IT Services', location: 'Bangalore, IN' },
  { name: 'Infosys', email: 'careers@infosys.com', industry: 'IT Services', location: 'Bangalore, IN' },
  { name: 'JP Morgan', email: 'jpmc@chase.com', industry: 'Finance', location: 'New York, NY' },
  { name: 'Morgan Stanley', email: 'wealth@morganstanley.com', industry: 'Finance', location: 'New York, NY' }
];

async function seed() {
  console.log('🏛️ Expanding SkillSync Corporate Network...');
  
  try {
    await client.connect();

    for (const corp of CORPORATE_GRID) {
      console.log(`🚀 Provisioning Entity: ${corp.name}`);

      // 1. Create User in auth.users
      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          email: corp.email,
          password: 'company123456',
          email_confirm: true,
          user_metadata: { role: 'company', name: corp.name }
        }),
      });

      const userData = await res.json();
      let userId = userData.id || userData.user?.id;

      if (!userId && userData.msg === 'A user with this email address has already been registered') {
        const dbIdRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [corp.email]);
        userId = dbIdRes.rows[0]?.id;
      }

      if (userId) {
        // 2. Sync Profile
        await client.query(
          `INSERT INTO company (company_id, company_name, email, industry, location, is_verified) 
           VALUES ($1, $2, $3, $4, $5, true) 
           ON CONFLICT (company_id) DO UPDATE SET company_name = EXCLUDED.company_name, industry = EXCLUDED.industry`,
          [userId, corp.name, corp.email, corp.industry, corp.location]
        );
        console.log(`   ✅ Synchronized: ${corp.name} (${userId})`);
      } else {
        console.error(`   ❌ Failed to provision: ${corp.name}`, userData);
      }
    }

    console.log('✨ Corporate Network expansion complete! 20+ entities online.');
  } catch (err) {
    console.error('💥 Critical Network Failure:', err.message);
  } finally {
    await client.end();
  }
}

seed();
