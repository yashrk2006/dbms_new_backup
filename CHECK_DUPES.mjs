import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function checkDuplicates() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('📡 Auditing Student Batch for Roll Number: 24/94076...');
    
    const { rows } = await client.query(`
      SELECT roll_no, name, COUNT(*) as occurs
      FROM college_directory 
      WHERE roll_no = '24/94076'
      GROUP BY roll_no, name
      HAVING COUNT(*) > 1;
    `);

    if (rows.length === 0) {
      console.log('✅ No duplicates found for this Roll Number.');
      
      // Let's also check if there are ANY duplicates in the whole table
      const { rows: totalDupes } = await client.query(`
        SELECT roll_no, COUNT(*) 
        FROM college_directory 
        GROUP BY roll_no 
        HAVING COUNT(*) > 1 
        LIMIT 5;
      `);
      
      if (totalDupes.length > 0) {
        console.log('⚠️ Duplicates found in the overall batch for other IDs:', totalDupes);
      }
    } else {
      console.warn('❌ DUPLICATES FOUND:', rows);
    }

  } catch (err) {
    console.error('❌ Audit Failed:', err.message);
  } finally {
    await client.end();
  }
}

checkDuplicates();
