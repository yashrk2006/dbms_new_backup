import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

const cs = process.env.DATABASE_URL;
console.log('Trying:', cs?.replace(/:([^:@]+)@/, ':***@'));

const client = new pg.Client({ connectionString: cs, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
client.connect()
  .then(() => client.query('SELECT current_database(), version()'))
  .then(r => { console.log('✅ Connected! DB:', r.rows[0].current_database); client.end(); })
  .catch(e => { console.log('❌', e.message); client.end(); });
