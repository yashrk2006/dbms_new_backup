import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function align() {
  console.log('📡 Aligning Identity Grid...');
  try {
    await client.connect();
    
    // Target ID from browser session
    const targetCompanyId = 'ecdc49e5-d984-4c1f-8f43-e9c2dcdcc524';
    const sourceEmail = 'os@apple.com'; // Wait, let me check the email of this ID if it exists
    
    console.log(`🔍 Checking if ID ${targetCompanyId} exists in auth.users...`);
    const authCheck = await client.query('SELECT email FROM auth.users WHERE id = $1', [targetCompanyId]);
    
    if (authCheck.rows.length > 0) {
      const email = authCheck.rows[0].email;
      console.log(`✅ Found user: ${email}`);
      
      console.log(`🖇️ Linking company record for ${email} to ID ${targetCompanyId}...`);
      
      // Check if company exists with this email
      const companyCheck = await client.query('SELECT company_id FROM company WHERE email = $1', [email]);
      
      if (companyCheck.rows.length > 0) {
        await client.query('UPDATE company SET company_id = $1 WHERE email = $2', [targetCompanyId, email]);
        console.log('✨ Success: Company ID aligned.');
      } else {
        console.log('⚠️ Company record not found for this email. Creating one...');
        await client.query(
          "INSERT INTO company (company_id, email, company_name, industry, location) VALUES ($1, $2, $3, 'Technology', 'Cupertino, CA')",
          [targetCompanyId, email, 'Apple']
        );
        console.log('✨ Success: Company record created and linked.');
      }
    } else {
      console.log('❌ ID not found in auth.users. Alignment aborted.');
    }
  } catch (err) {
    console.error('💥 Alignment Failed:', err.message);
  } finally {
    await client.end();
  }
}

align();
