const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres.hpflcuyxmwzrknxjgavd:Fuckgambling123!@aws-1-ca-central-1.pooler.supabase.com:6543/postgres';

async function applyHotfix() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Read the emergency hotfix migration
        const sql = fs.readFileSync('./supabase/migrations/20251204000001_emergency_drop_recursive_policies.sql', 'utf8');

        console.log('🔧 Applying emergency hotfix to remove recursive policies...');
        await client.query(sql);

        console.log('✅ Hotfix applied successfully!');
        console.log('🎯 RLS policies fixed - users should now be able to access the site');

    } catch (error) {
        console.error('❌ Error applying hotfix:', error);
        throw error;
    } finally {
        await client.end();
    }
}

applyHotfix();
