const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres.hpflcuyxmwzrknxjgavd:Fuckgambling123!@aws-1-ca-central-1.pooler.supabase.com:6543/postgres';

async function applyAnonFix() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        console.log('🔧 Applying anon user creation fix...');
        const sql = fs.readFileSync('./supabase/migrations/20251204000003_allow_anon_user_creation.sql', 'utf8');
        await client.query(sql);

        console.log('✅ Anon fix applied successfully!');
        console.log('🎯 Users can now create accounts without JWT validation');
        console.log('⚠️  Note: This is a temporary workaround. Clerk-Supabase integration should be configured for production.');

    } catch (error) {
        console.error('❌ Error applying fix:', error);
        throw error;
    } finally {
        await client.end();
    }
}

applyAnonFix();
