import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function seed() {
  console.log('🚀 Starting Institutional Batch Seeding...');
  const payload = JSON.parse(fs.readFileSync('./tmp/migration_payload.json', 'utf8'));
  console.log(`📊 Reading ${payload.length} unique student records...`);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database. Beginning batch insert...');

    // Chunk size 100 for performance
    const chunkSize = 100;
    for (let i = 0; i < payload.length; i += chunkSize) {
      const chunk = payload.slice(i, i + chunkSize);
      
      const values = chunk.map((s, idx) => 
        `($${idx * 7 + 1}, $${idx * 7 + 2}, $${idx * 7 + 3}, $${idx * 7 + 4}, $${idx * 7 + 5}, $${idx * 7 + 6}, $${idx * 7 + 7})`
      ).join(',');

      const params = chunk.flatMap(s => [
        s.roll_no,
        s.enrollment_no,
        s.name,
        s.role,
        s.course,
        s.branch,
        s.batch_year
      ]);

      const query = `
        INSERT INTO college_directory (roll_no, enrollment_no, name, role, course, branch, batch_year)
        VALUES ${values}
        ON CONFLICT (roll_no) DO UPDATE SET
          enrollment_no = EXCLUDED.enrollment_no,
          name = EXCLUDED.name,
          course = EXCLUDED.course,
          branch = EXCLUDED.branch
      `;

      await client.query(query, params);
      console.log(`📈 Progress: ${Math.min(i + chunkSize, payload.length)} / ${payload.length}`);
    }

    console.log('🚀 SkillSync Institutional Directory successfully seeded!');
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
  } finally {
    await client.end();
  }
}

seed();
