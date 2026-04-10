import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        const sql = fs.readFileSync('APPLY_THIS_SQL.sql', 'utf8');
        console.log('Executing SQL from APPLY_THIS_SQL.sql...');

        await client.query(sql);
        console.log('✅ SQL executed successfully');
    } catch (err) {
        console.error('❌ Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();
