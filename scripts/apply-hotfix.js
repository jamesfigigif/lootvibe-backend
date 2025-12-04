const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres.hpflcuyxmwzrknxjgavd:Fuckgambling123!@aws-1-ca-central-1.pooler.supabase.com:6543/postgres';

async function applyHotfix() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Read and apply the emergency hotfix migrations
        console.log('🔧 Step 1: Removing recursive policies...');
        const sql1 = fs.readFileSync('./supabase/migrations/20251204000001_emergency_drop_recursive_policies.sql', 'utf8');
        await client.query(sql1);
        console.log('✅ Step 1 complete');

        console.log('🔧 Step 2: Fixing INSERT policy...');
        const sql2 = fs.readFileSync('./supabase/migrations/20251204000002_fix_user_insert_policy.sql', 'utf8');
        await client.query(sql2);
        console.log('✅ Step 2 complete');

        console.log('✅ All hotfixes applied successfully!');
        console.log('🎯 RLS policies fixed - users should now be able to create accounts and access the site');

    } catch (error) {
        console.error('❌ Error applying hotfix:', error);
        throw error;
    } finally {
        await client.end();
    }
}

applyHotfix();
